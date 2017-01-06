using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public static class ServiceManager
    {
        static Singelton<CacheService> fileService { get; set; } = new Singelton<CacheService>();
        static Singelton<FileSerice> fileServiceBasic { get; set; } = new Singelton<FileSerice>();

        public static IFileService GetFileService()
        {
            return fileServiceBasic.Value;
        }
    }

    public class Singelton<T> where T : class
    {
        private T value;
        public T Value
        {
            get
            {
                if (value == null)
                {
                    value = MakeInstance();
                }
                return value;
            }
        }

        private Func<T> constructor;

        public Singelton()
        {

        }

        public Singelton(Func<T> constructor)
        {
            this.constructor = constructor;
        }

        private T MakeInstance()
        {
            if (constructor != null)
            {
                return constructor();
            }
            return Activator.CreateInstance<T>();
        }
    }

    public interface IFileService
    {
        byte[] ReadAllBytes(string path);
    }

    class FileSerice : IFileService
    {
        public byte[] ReadAllBytes(string path)
        {
            FileInfo fi = new FileInfo(path);
            if (fi.Exists)
            {
                return File.ReadAllBytes(fi.FullName);
            }
            throw new FileNotFoundException("Could not find file: " + path.ToString());
        }
    }

    class CacheService : IFileService
    {
        Dictionary<string, byte[]> cachedData { get; set; } = new Dictionary<string, byte[]>();

        public byte[] ReadAllBytes(string path)
        {
            FileInfo fi = new FileInfo(path);
            if (cachedData.ContainsKey(fi.FullName))
                return cachedData[fi.FullName];
            if (fi.Exists)
            {
                byte[] data = File.ReadAllBytes(fi.FullName);
                cachedData[fi.FullName] = data;
                return data;
            }
            throw new FileNotFoundException("Could not find file: " + path.ToString());
        }
    }
}
