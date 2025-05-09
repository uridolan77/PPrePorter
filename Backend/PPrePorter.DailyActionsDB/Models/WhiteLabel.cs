using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PPrePorter.DailyActionsDB.Models
{
    /// <summary>
    /// Represents a white label (brand) in the system
    /// </summary>
    public class WhiteLabel
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public virtual ICollection<DailyAction> DailyActions { get; set; } = new List<DailyAction>();
    }
}
