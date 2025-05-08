using PPrePorter.Domain.Common;

namespace PPrePorter.Core.Models.Reports
{
    public class ReportTemplateCategory : BaseEntity
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public string Icon { get; set; }
    }
}
