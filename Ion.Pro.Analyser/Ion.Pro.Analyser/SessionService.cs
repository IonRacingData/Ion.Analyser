using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public class SessionService
    {
        public const string sessionKey = "__sessionid";
        public Dictionary<string, Session> Sessions { get; private set; } = new Dictionary<string, Session>();

        public Session CreateSession()
        {
            return CreateSession(Guid.NewGuid().ToString());
        }

        private Session CreateSession(string key)
        {
            Session session = new Session() { Key = key };
            Sessions[key] = session;
            return session;
        }

        public Session GetOrCreate(string key)
        {
            if (!Sessions.ContainsKey(key))
            {
                return CreateSession(key);
            }
            return Sessions[key];
        }
    }

    public class Session
    {
        public string Key { get; set; }
        public Dictionary<string, object> SessionData { get; private set; } = new Dictionary<string, object>();

        public T GetValueOrDefault<T>(string key)
        {
            return GetValueOrDefault<T>(key, default(T));
        }

        public T GetValueOrDefault<T>(string key, T defaultValue)
        {
            if (SessionData.ContainsKey(key) && SessionData[key] is T)
            {
                return (T)SessionData[key];
            }
            return defaultValue;
        }
    }
}
