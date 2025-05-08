namespace PPrePorter.SemanticLayer.Models.Entities
{
    /// <summary>
    /// Base class for semantic layer entities
    /// </summary>
    public abstract class Entity
    {
        /// <summary>
        /// Name of the entity
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Description of the entity
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Category of the entity (e.g., Financial, Player, Game)
        /// </summary>
        public string Category { get; set; } = string.Empty;
        
        /// <summary>
        /// Alternative terms for the entity
        /// </summary>
        public string[]? Synonyms { get; set; }
    }
}