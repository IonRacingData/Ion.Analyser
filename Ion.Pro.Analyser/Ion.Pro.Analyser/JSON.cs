using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace NicroWare.Pro.DmxControl.JSON
{
    public class CodeContainer
    {
        public string Code { get { return code.ToString(); } }
        char[] code { get; set; }
        //string code { get; set; }
        public int CurLine { get; private set; } = 0;
        public int CurLinePos { get; private set; } = 0;
        public int Pos { get { return pos; } }
        public int pos;
        //int peekCall = 0;
        //int getCall = 0;

        char currentChar;

        public CodeContainer(string code)
        {
            //this.code = code;
            this.code = code.ToCharArray();
            Get();
        }

        public char Peek()
        {
            return currentChar;
        }

        public char Get()
        {

            //getCall++;
            char current = currentChar;
            currentChar = code[pos++];
            if (current == '\n')
            {
                CurLine++;
                CurLinePos = 0;
            }
            else
                CurLinePos++;
            return current;
        }

        public char NextNonWhiteSpace()
        {
            char c = Peek();
            while (c == ' ' || c == '\n' || c == '\r' || c == '\t')
            {
                Get();
                c = Peek();
            }
            return c;
        }

        public bool MoreToRead()
        {
            return pos < code.Length;
        }

        public string ReadString()
        {
            StringBuilder builder = new StringBuilder();
            if (Peek() == '"')
                Get();
            while (MoreToRead())
            {
                char currentChar = Get();
                if (currentChar == '\\')
                    continue;
                else if (currentChar == '"')
                {
                    break;
                }
                else
                    builder.Append(currentChar);
            }
            return builder.ToString();
        }
    }

    public class JSONObject
    {
        public bool AllowNull { get; set; } = true;
        public JSONNode BaseNode { get; set; }

        public T ToArray<T>()
        {
            return (T)GetArray(BaseNode, typeof(T));
        }

        public T ToObject<T>()
            where T : new()
        {
            T t = new T();
            if (BaseNode is JSONNodeObject)
            {
                if (typeof(IJSONSerializable).IsAssignableFrom(typeof(T)))
                    ((IJSONSerializable)t).Deserialize((JSONNodeObject)BaseNode);
                else
                    FillObject(t, (JSONNodeObject)BaseNode);
            }
            return t;
        }

        private void FillObject(object o, JSONNodeObject node)
        {
            if (typeof(IJSONSerializable).IsAssignableFrom(o.GetType()))
            {
                ((IJSONSerializable)o).Deserialize(node);
            }
            else
            {
                PropertyInfo[] properties = o.GetType().GetProperties();
                foreach (JSONField n in node.Fields)
                {
                    foreach (PropertyInfo p in properties)
                    {
                        /*if (node.LinkFields.ContainsKey(p.Name))
                        {
                            p.SetValue(o, GetObject(node.LinkFields[p.Name], p.PropertyType));
                        }*/
                        if (p.Name == n.Name)
                        {
                            p.SetValue(o, GetObject(n.Value, p.PropertyType));
                            break;
                        }
                    }
                }
            }
        }

        private object GetObject(JSONNode node, Type t)
        {
            if (node is JSONString)
            {
                return t.IsEnum ? Enum.Parse(t, ((JSONString)node).StringValue) : ((JSONString)node).StringValue;
            }
            else if (node is JSONNumber)
            {
                return GetObjectValue(((JSONNumber)node).NumberValue, t);
            }
            else if (node is JSONBool)
            {
                return ((JSONBool)node).BoolValue;
            }
            else if (node is JSONNull)
            {
                return null;
            }
            else if (node is JSONNodeArray)
            {
                return GetArray(node, t);
            }
            else if (node is JSONNodeObject)
            {
                object temp = Activator.CreateInstance(t);
                FillObject(temp, (JSONNodeObject)node);
                return temp;
            }
            return null;
        }

        private object GetArray(JSONNode node, Type t)
        {
            JSONNodeArray temp = ((JSONNodeArray)node);
            Type elementType = null;
            Type iType;
            if (t.IsArray)
            {
                elementType = t.GetElementType();
                Array a = Array.CreateInstance(elementType, temp.Nodes.Count);
                int i = 0;
                foreach (JSONNode arrayNode in temp.Nodes)
                {
                    a.SetValue(GetObject(arrayNode, elementType), i);
                    i++;
                }
                return a;
            }
            else if ((iType = t.GetInterface("ICollection`1")) != null && iType.GenericTypeArguments.Length > 0)
            {
                elementType = iType.GenericTypeArguments[0];
                object o = Activator.CreateInstance(t);
                MethodInfo mi = t.GetMethod("Add");
                foreach (JSONNode arrayNode in temp.Nodes)
                {
                    mi.Invoke(o, new object[] { GetObject(arrayNode, elementType) });
                }
                return o;
            }
            else
            {
                throw new Exception("Can't determin type of list");
            }
        }

        public string ToJsonString()
        {
            StringBuilder builder = new StringBuilder();
            BaseNode.ToJsonString(builder);
            return builder.ToString();
        }

        public static JSONObject Parse(string jsonString)
        {
            JSONObject temp = new JSONObject();
            CodeContainer container = new CodeContainer(jsonString);
            char firstChar = container.NextNonWhiteSpace();
            if (firstChar == '{')
                temp.BaseNode = new JSONNodeObject().Parse(container);
            else if (firstChar == '[')
                temp.BaseNode = new JSONNodeArray().Parse(container);
            return temp;
        }

        public static JSONObject Create(object o)
        {
            JSONObject jso = new JSONObject();
            Type t = o.GetType();
            if (t.IsArray || (typeof(IEnumerable).IsAssignableFrom(o.GetType())))
            {
                jso.BaseNode = CreateArray(o, t);
            }
            else
            {
                jso.BaseNode = CreateObject(o);
            }
            return jso;
        }

        private static JSONNodeObject CreateObject(object o)
        {
            JSONNodeObject baseNode = new JSONNodeObject();
            if (typeof(IJSONSerializable).IsAssignableFrom(o.GetType()))
            {
                baseNode = ((IJSONSerializable)o).Serialize();
            }
            else
            {
                PropertyInfo[] properties = o.GetType().GetProperties();
                foreach (PropertyInfo pi in properties)
                {
                    if (pi.GetCustomAttribute(typeof(SerializeIgnoreAttribute)) == null)
                    {
                        object nodeVal = pi.GetValue(o);
                        JSONNode node = CreateNode(nodeVal, pi.PropertyType);
                        baseNode.Fields.Add(new JSONField() { Name = pi.Name, Value = node });
                    }
                }
            }
            return baseNode;
        }

        private static JSONNode CreateNode(object nodeVal)
        {
            return CreateNode(nodeVal, nodeVal.GetType());
        }

        private static JSONNode CreateNode(object nodeVal, Type type)
        {
            if (type == null)
                type = nodeVal.GetType();
            JSONNode temp = null;
            if (nodeVal == null)
                temp = new JSONNull();
            else if (typeof(string).IsAssignableFrom(type))
                temp = new JSONString() { StringValue = (string)nodeVal };
            else if (typeof(bool).IsAssignableFrom(type))
                temp = new JSONBool() { BoolValue = (bool)nodeVal };
            else if (type.IsEnum)
                temp = new JSONString() { StringValue = ((Enum)nodeVal).ToString("F") };
            else if (typeof(ValueType).IsAssignableFrom(type))
                temp = new JSONNumber() { NumberValue = GetNumberValue(nodeVal) };
            else if (type.IsArray || typeof(IEnumerable).IsAssignableFrom(type))
                temp = CreateArray(nodeVal, type);
            else
                temp = CreateObject(nodeVal);
            return temp;
        }

        static Dictionary<Type, Func<object, double>> objectFixer = new Dictionary<Type, Func<object, double>>()
        {
            { typeof(SByte), (o) => (SByte)o }
            , { typeof(Int16), (o) => (Int16)o }
            , { typeof(Int32), (o) => (Int32)o }
            , { typeof(Int64), (o) => (Int64)o }
            , { typeof(Byte), (o) => (Byte)o }
            , { typeof(UInt16), (o) => (UInt16)o }
            , { typeof(UInt32), (o) => (UInt32)o }
            , { typeof(UInt64), (o) => (UInt64)o }
            , { typeof(Single), (o) => (Single)o }
            , { typeof(Double), (o) => (Double)o }
            , { typeof(Decimal), (o) => (Double)(Decimal)o }
        };

        static Dictionary<Type, Func<double, object>> doubleFixer = new Dictionary<Type, Func<double, object>>()
        {
            { typeof(SByte), (d) => (SByte)d } //TODO: add rounding for int casts ? 
            , { typeof(Int16), (d) => (Int16)d }
            , { typeof(Int32), (d) => (Int32)d }
            , { typeof(Int64), (d) => (Int64)d }
            , { typeof(Byte), (d) => (Byte)d }
            , { typeof(UInt16), (d) => (UInt16)d }
            , { typeof(UInt32), (d) => (UInt32)d }
            , { typeof(UInt64), (d) => (UInt64)d }
            , { typeof(Single), (d) => (Single)d }
            , { typeof(Double), (d) => (Double)d }
            , { typeof(Decimal), (d) => (Double)(Decimal)d }
        };

        private static double GetNumberValue(object num)
        {
            var type = num.GetType();
            if (objectFixer.ContainsKey(type))
                return objectFixer[type](num);
            else
                throw new NotFiniteNumberException("num is not a number");
        }

        private static object GetObjectValue(double num, Type t)
        {
            if (doubleFixer.ContainsKey(t))
                return doubleFixer[t](num);
            else
                throw new NotFiniteNumberException("num is not a number");
        }

        private static JSONNodeArray CreateArray(object o, Type t)
        {
            IEnumerable a = (IEnumerable)o;
            JSONNodeArray arrayNode = new JSONNodeArray();
            foreach (object obj in a)
            {
                arrayNode.Nodes.Add(CreateNode(obj, t.GetElementType()));
            }
            return arrayNode;
        }

        public static JSONNode ParseNodeStart(char c, CodeContainer doc)
        {
            JSONNode value = null;
            switch (c)
            {
                case '"':
                    value = new JSONString().Parse(doc);
                    break;
                case '[':
                    value = new JSONNodeArray().Parse(doc);
                    break;
                case '{':
                    value = new JSONNodeObject().Parse(doc);
                    break;
                case 'n':
                case 'N':
                    value = new JSONNull().Parse(doc);
                    break;
                case 't':
                case 'T':
                case 'f':
                case 'F':
                    value = new JSONBool().Parse(doc);
                    break;
                default:
                    if (char.IsNumber(c) || c == '-')
                        value = new JSONNumber().Parse(doc);
                    break;
            }
            return value;
        }
    }

    public abstract class JSONNode
    {
        public abstract JSONNode Parse(CodeContainer doc);

        public abstract void ToJsonString(StringBuilder builder);
    }

    public class JSONString : JSONNode
    {
        public string StringValue { get; set; }

        public override JSONNode Parse(CodeContainer doc)
        {
            StringValue = doc.ReadString();
            return this;
        }

        public override void ToJsonString(StringBuilder builder)
        {
            builder.Append("\"" + StringValue.Replace("\\", "\\\\").Replace("\r", "\\r").Replace("\n", "\\n").Replace("\"", "'") + "\"");
        }

        public static JSONString ToEnumString(Enum e)
        {
            return new JSONString() { StringValue = e.ToString() };
        }

        public override string ToString()
        {
            //TODO: Implement correct escape characters
            return "\"" + StringValue + "\"";
        }
    }

    public class JSONNumber : JSONNode
    {
        public double NumberValue { get; set; }

        public override JSONNode Parse(CodeContainer doc)
        {
            StringBuilder builder = new StringBuilder();
            int mod = 1;
            if (doc.Peek() == '-')
            {
                mod = -1;
                doc.Get();
            }
            doc.NextNonWhiteSpace();
            while (char.IsNumber(doc.Peek()) || doc.Peek() == '.')
            {
                builder.Append(doc.Get());
            }
            double outTest;
            if (!double.TryParse(builder.ToString(), NumberStyles.Float, NumberFormatInfo.InvariantInfo, out outTest))
                throw new FormatException("Wrong format on number at: " + doc.pos + " Line: " + doc.CurLine + " LinePos: " + doc.CurLinePos);
            this.NumberValue = outTest * mod;
            return this;
        }

        public override void ToJsonString(StringBuilder builder)
        {
            //NumberFormatInfo because some contries uses , for decimal seperation and other uses . And we need . for beeign compliant with the JSON Specs
            builder.Append(NumberValue.ToString(NumberFormatInfo.InvariantInfo));
        }

        public override string ToString()
        {
            return NumberValue.ToString();
        }
    }

    public class JSONBool : JSONNode
    {
        public bool BoolValue;
        public JSONBool()
        {
        }

        public override JSONNode Parse(CodeContainer doc)
        {
            string s = "";
            char temp = ' ';
            while (char.IsLetter((temp = doc.Peek())))
            {
                s += temp;
                doc.Get();
            }
            if (!bool.TryParse(s, out BoolValue))
            {
                throw new FormatException();
            }
            return this;
        }

        public override void ToJsonString(StringBuilder builder)
        {
            builder.Append(BoolValue.ToString().ToLower());
        }

        public override string ToString()
        {
            return BoolValue.ToString();
        }
    }

    public class JSONNull : JSONNode
    {
        public JSONNull()
        {
        }

        public override JSONNode Parse(CodeContainer doc)
        {
            string s = doc.Get().ToString() + doc.Get() + doc.Get() + doc.Get();
            s = s.ToLower();
            if (s != "null")
                throw new FormatException();
            return this;
        }

        public override void ToJsonString(StringBuilder builder)
        {
            builder.Append("null");
        }
    }

    public class JSONField : JSONNode
    {
        public string Name { get; set; }
        public JSONNode Value { get; set; }
        public override JSONNode Parse(CodeContainer doc)
        {
            while (doc.Peek() != '"')
                doc.Get();
            Name = doc.ReadString();
            while (doc.Peek() != ':')
                doc.Get();
            doc.Get();
            char c = doc.NextNonWhiteSpace();
            Value = JSONObject.ParseNodeStart(c, doc);

            return this;
        }

        public override void ToJsonString(StringBuilder builder)
        {
            builder.Append($"\"{Name}\":");
            Value.ToJsonString(builder);
        }

        public override string ToString()
        {
            return $"\"{Name}\": {Value}";
        }
    }

    public class JSONNodeObject : JSONNode
    {
        public List<JSONField> Fields { get; set; } = new List<JSONField>();
        public Dictionary<string, JSONNode> LinkFields = new Dictionary<string, JSONNode>();
        public JSONNodeObject()
        {
        }

        public override JSONNode Parse(CodeContainer doc)
        {
            if (doc.NextNonWhiteSpace() == '{')
            {
                doc.Get();
                doc.NextNonWhiteSpace();
            }
            char curChar = doc.Peek();
            while (true)
            {
                if (curChar == '/' && doc.Peek() == '/')
                {
                    while (curChar != '\n')
                    {
                        curChar = doc.Get();
                    }
                    curChar = doc.NextNonWhiteSpace();
                }
                if (curChar == '"')
                {
                    JSONField jsonField = (JSONField)new JSONField().Parse(doc);
                    Fields.Add(jsonField);
                    //LinkFields.Add(jsonField.Name, jsonField.Value);
                }
                if (curChar == '}')
                    break;

                //doc.Get();
                curChar = doc.NextNonWhiteSpace();
                if (curChar == ',')
                {
                    doc.Get();
                    curChar = doc.NextNonWhiteSpace();
                }
            }
            if (doc.MoreToRead())
                doc.Get();
            return this;

        }

        public override void ToJsonString(StringBuilder builder)
        {
            bool first = true;
            builder.Append("{");
            foreach (JSONField field in Fields)
            {
                if (first)
                    first = false;
                else
                    builder.Append(',');
                field.ToJsonString(builder);
            }
            builder.Append("}");
        }
    }

    public class JSONNodeArray : JSONNode
    {
        public List<JSONNode> Nodes { get; set; } = new List<JSONNode>();
        public JSONNodeArray()
        {
        }

        public override JSONNode Parse(CodeContainer doc)
        {
            if (doc.NextNonWhiteSpace() == '[')
            {
                doc.Get();
                doc.NextNonWhiteSpace();
            }
            char c = doc.Peek();
            while (true)
            {
                if (c == '/' && doc.Peek() == '/')
                {
                    while (c != '\n')
                    {
                        c = doc.Get();
                    }
                    c = doc.NextNonWhiteSpace();
                }
                if (c == ']')
                    break;
                Nodes.Add(JSONObject.ParseNodeStart(c, doc));

                c = doc.NextNonWhiteSpace();
                if (c == ',')
                {
                    doc.Get();
                    c = doc.NextNonWhiteSpace();
                }
            }
            if (doc.MoreToRead())
                doc.Get();
            return this;
        }

        public override void ToJsonString(StringBuilder builder)
        {
            builder.Append("[");
            bool first = true;
            foreach (JSONNode n in Nodes)
            {
                if (first) first = false;
                else builder.Append(',');
                n.ToJsonString(builder);
            }
            builder.Append("]");
        }
    }

    public interface IJSONSerializable
    {
        JSONNodeObject Serialize();
        object Deserialize(JSONNodeObject node);
    }

    public static class JSONExtension
    {
        public static JSONNode GetFieldValue(this JSONNodeObject obj, string name)
        {
            foreach (JSONField field in obj.Fields)
            {
                if (field.Name == name)
                    return field.Value;
            }
            return null;
        }

        public static T GetFieldValue<T>(this JSONNodeObject obj, string name)
            where T : JSONNode
        {
            return (T)obj.GetFieldValue(name);
        }

        public static void AddJString(this JSONNodeObject obj, string name, string s)
        {
            obj.AddJNode(name, new JSONString() { StringValue = s });
        }

        public static void AddJNumber(this JSONNodeObject obj, string name, double number)
        {
            obj.AddJNode(name, new JSONNumber() { NumberValue = number });
        }

        public static void AddJNode(this JSONNodeObject obj, string name, JSONNode val)
        {
            obj.Fields.Add(new JSONField() { Name = name, Value = val });
        }
    }

    public class SerializeIgnoreAttribute : Attribute { }

    //String
    //Number
    //Object
    //Array
    //Bool
    //Null
}
