using System;
using System.Collections.Generic;
using System.Text;

namespace PPrePorter.Core.Models.Reports
{
    public class NullSafeExtensions
    {
        public static string SafeToString(object value)
        {
            return value?.ToString() ?? string.Empty;
        }

        public static string SafeFormat(DateTime? dateValue, string format)
        {
            return dateValue?.ToString(format ?? "yyyy-MM-dd") ?? string.Empty;
        }
    }
}
