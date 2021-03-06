﻿using Ion.Pro.Analyser.Web;
using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public delegate IActionResult HttpAction();

    public class Controller
    {
        public Dictionary<string, MethodInfo> AllActions { get; private set; } = new Dictionary<string, MethodInfo>();
        public HttpContext HttpContext { get; set; }
        public string BasePath = IonAnalyserWebPage.ContentPath;

        public Controller()
        {
            Type thisType = GetType();
            MethodInfo[] allInfos = thisType.GetMethods();

            foreach (MethodInfo mi in allInfos)
            {
                if (mi.ReturnType == typeof(IActionResult))
                {
                    AllActions[mi.Name.ToLower()] = mi;
                }
            }
        }


        public IActionResult View(string file)
        {
            return new ViewResult(BasePath, file);
        }

        public IActionResult Json(object obj)
        {
            return new JsonResult(obj);
        }

        public IActionResult String(string data)
        {
            return new StringResult(data);
        }

        public IActionResult String(string data, string contentType)
        {
            return new StringResult(data, contentType);
        }

        public IActionResult Error(string data, HttpStatus code)
        {
            return new ErrorResult(code, data);
        }

        public IActionResult File(byte[] data, string file, bool forceDownload)
        {
            return new FileResult(data, file, forceDownload);
        }
    }

    public interface IActionResult
    {
        Task ExecuteResultAsync(ActionContext context);
    }

    public class ActionContext
    {
        public HttpContext HttpContext { get; set; }
    }

    public class ErrorResult : IActionResult
    {
        HttpStatus statusCode;
        string message;

        public ErrorResult(HttpStatus code, string message)
        {
            this.statusCode = code;
            this.message = message;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            StringResult result = new StringResult("<h1>404 file not found</h1><h3>" + message + "</h3>", MimeTypes.GetMimeType(".html"));
            await result.ExecuteResultAsync(context);
            context.HttpContext.Response.Code = statusCode;
        }
    }

    public class ViewResult : IActionResult
    {
        string fileName = "";
        public ViewResult(string path, string file)
        {
            fileName = Path.Combine(path, file + ".html");
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            FileInfo fi = new FileInfo(fileName);
            if (fi.Exists)
            {
                context.HttpContext.Response.ContentType = MimeTypes.GetMimeType(".html");
                context.HttpContext.Response.Data = await Task.FromResult(ServiceManager.GetFileService().ReadAllBytes(fi.FullName));
            }
            else
            {
                ErrorResult result = new ErrorResult(HttpStatus.NotFound404, fi.FullName + " was not found");
                await result.ExecuteResultAsync(context);
            }
        }
    }

    public class StringResult : IActionResult
    {
        string data;
        string contentType = "text/plain";

        public StringResult(string data)
        {
            this.data = data;
        }

        public StringResult(string data, string contentType)
            : this(data)
        {
            this.contentType = contentType;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            context.HttpContext.Response.ContentType = contentType;
            context.HttpContext.Response.Data = await Task.FromResult(Encoding.Default.GetBytes(this.data));
        }

    }

    public class FileResult : IActionResult
    {
        string file;
        bool forceDownload = false;
        bool inMemoryFile = false;
        byte[] data;

        public FileResult(string path)
            : this(path, false)
        {

        }

        public FileResult(string path, bool forceDownload)
        {
            this.file = path;
            this.forceDownload = forceDownload;
        }

        public FileResult(byte[] data, string filename, bool forceDownload)
        {
            inMemoryFile = true;
            this.data = data;
            this.file = filename;
            this.forceDownload = forceDownload;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            FileInfo fi = new FileInfo(file);
            if (inMemoryFile)
            {
                context.HttpContext.Response.ContentType = MimeTypes.GetMimeType(forceDownload ? "binary" : fi.Extension);
                context.HttpContext.Response.HttpHeaderFields.Add("Content-Disposition", "Content-Disposition: attachment; filename=\"" + fi.Name + "\"");
                context.HttpContext.Response.Data = await Task.FromResult(data);
            }
            else
            {
                if (fi.Exists)
                {
                    context.HttpContext.Response.ContentType = MimeTypes.GetMimeType(forceDownload ? "binary" : fi.Extension);
                    context.HttpContext.Response.HttpHeaderFields.Add("Content-Disposition", "Content-Disposition: attachment; filename=\"" + fi.Name + "\"");
                    context.HttpContext.Response.Data = await Task.FromResult(ServiceManager.GetFileService().ReadAllBytes(fi.FullName));
                }
                else
                {
                    ErrorResult result = new ErrorResult(HttpStatus.NotFound404, fi.FullName + " was not found");
                    await result.ExecuteResultAsync(context);
                }
            }
        }
    }

    public class JsonResult : IActionResult
    {
        object baseObject;

        public JsonResult(object obj)
        {
            this.baseObject = obj;
        }

        public async Task ExecuteResultAsync(ActionContext context)
        {
            StringResult result = null;
            try
            {
                result = new StringResult(JSONObject.Create(baseObject).ToJsonString(), MimeTypes.GetMimeType(".json"));
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e);
            }
            await result.ExecuteResultAsync(context);
        }
    }
}
