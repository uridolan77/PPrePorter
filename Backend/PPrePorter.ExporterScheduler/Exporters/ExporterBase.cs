using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PPrePorter.ExporterScheduler.Interfaces;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Exporters
{
    /// <summary>
    /// Base class for all exporters providing common functionality
    /// </summary>
    public abstract class ExporterBase : IExporter
    {
        public abstract Task<byte[]> ExportAsync(IEnumerable<dynamic> data, ExportParameters parameters);
        public abstract string ContentType { get; }
        public abstract string FileExtension { get; }
        
        /// <summary>
        /// Generates a consistent filename for exported reports
        /// </summary>
        protected string GenerateFileName(ExportParameters parameters)
        {
            return $"{parameters.ReportName}_{DateTime.Now:yyyyMMdd_HHmmss}{FileExtension}";
        }
        
        /// <summary>
        /// Gets all property names from a dynamic object
        /// </summary>
        protected List<string> GetDynamicProperties(dynamic obj)
        {
            if (obj == null) return new List<string>();
            return ((IDictionary<string, object>)obj).Keys.ToList();
        }
        
        /// <summary>
        /// Gets property value from a dynamic object
        /// </summary>
        protected object GetPropertyValue(dynamic obj, string propertyName)
        {
            var dictionary = (IDictionary<string, object>)obj;
            return dictionary.TryGetValue(propertyName, out var value) ? value : null;
        }
    }
}