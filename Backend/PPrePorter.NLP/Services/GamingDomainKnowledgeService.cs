using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using PPrePorter.NLP.Interfaces;
using PPrePorter.NLP.Models;
using PPrePorter.NLP.Models.Dictionaries;

namespace PPrePorter.NLP.Services;

/// <summary>
/// Service that provides domain-specific gaming knowledge for NLP entity resolution
/// </summary>
public class GamingDomainKnowledgeService : IDomainKnowledgeService
{
    private readonly ILogger<GamingDomainKnowledgeService> _logger;
    private readonly Dictionary<string, DbMetric> _metricMappings;
    private readonly Dictionary<string, DbDimension> _dimensionMappings;
    
    public GamingDomainKnowledgeService(ILogger<GamingDomainKnowledgeService> logger)
    {
        _logger = logger;
        _metricMappings = InitializeMetricMappings();
        _dimensionMappings = InitializeDimensionMappings();
    }
    
    /// <summary>
    /// Gets all known metrics in the gaming domain
    /// </summary>
    public Dictionary<string, DbMetric> GetMetricMappings()
    {
        return _metricMappings;
    }
    
    /// <summary>
    /// Gets all known dimensions in the gaming domain
    /// </summary>
    public Dictionary<string, DbDimension> GetDimensionMappings()
    {
        return _dimensionMappings;
    }
    
    /// <summary>
    /// Maps a natural language metric term to a known database field
    /// </summary>
    public DbMetric? MapMetricToDatabaseField(string metricTerm)
    {
        if (string.IsNullOrWhiteSpace(metricTerm))
            return null;
        
        // Normalize the term
        var normalizedTerm = metricTerm.ToLower().Trim();
        
        // Direct match in dictionary
        if (_metricMappings.TryGetValue(normalizedTerm, out var directMatch))
            return directMatch;
        
        // Check for synonym matches
        foreach (var metric in _metricMappings.Values)
        {
            if (metric.Synonyms != null && metric.Synonyms.Any(s => s.Equals(normalizedTerm, StringComparison.OrdinalIgnoreCase)))
                return metric;
        }
        
        // Try fuzzy matching (simplified version - in a real implementation, this would be more sophisticated)
        var bestMatch = _metricMappings.Values
            .Select(m => new 
            { 
                Metric = m, 
                Score = CalculateSimilarity(normalizedTerm, m.Name.ToLower())
            })
            .OrderByDescending(m => m.Score)
            .FirstOrDefault();
        
        if (bestMatch != null && bestMatch.Score > 0.7)
            return bestMatch.Metric;
        
        _logger.LogWarning("Could not map metric term: {Term}", metricTerm);
        return null;
    }
    
    /// <summary>
    /// Maps a natural language dimension term to a known database field
    /// </summary>
    public DbDimension? MapDimensionToDatabaseField(string dimensionTerm)
    {
        if (string.IsNullOrWhiteSpace(dimensionTerm))
            return null;
        
        // Normalize the term
        var normalizedTerm = dimensionTerm.ToLower().Trim();
        
        // Direct match in dictionary
        if (_dimensionMappings.TryGetValue(normalizedTerm, out var directMatch))
            return directMatch;
        
        // Check for synonym matches
        foreach (var dimension in _dimensionMappings.Values)
        {
            if (dimension.Synonyms != null && dimension.Synonyms.Any(s => s.Equals(normalizedTerm, StringComparison.OrdinalIgnoreCase)))
                return dimension;
        }
        
        // Try fuzzy matching (simplified version - in a real implementation, this would be more sophisticated)
        var bestMatch = _dimensionMappings.Values
            .Select(d => new 
            { 
                Dimension = d, 
                Score = CalculateSimilarity(normalizedTerm, d.Name.ToLower())
            })
            .OrderByDescending(d => d.Score)
            .FirstOrDefault();
        
        if (bestMatch != null && bestMatch.Score > 0.7)
            return bestMatch.Dimension;
        
        _logger.LogWarning("Could not map dimension term: {Term}", dimensionTerm);
        return null;
    }
    
    /// <summary>
    /// Resolves a time expression to an actual date range
    /// </summary>
    public TimeRange ResolveTimeRange(TimeRange timeRange)
    {
        if (timeRange == null)
        {
            // Default to last 30 days if no time range specified
            return new TimeRange
            {
                Start = DateTime.UtcNow.AddDays(-30).ToString("yyyy-MM-dd"),
                End = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Period = "daily",
                IsRelative = true,
                RelativePeriod = "last_30_days"
            };
        }
        
        // If we already have explicit dates, just validate them
        if (!string.IsNullOrEmpty(timeRange.Start) && !string.IsNullOrEmpty(timeRange.End))
        {
            // Validate date formats and that start <= end
            if (DateTime.TryParse(timeRange.Start, out var startDate) && 
                DateTime.TryParse(timeRange.End, out var endDate) && 
                startDate <= endDate)
            {
                return timeRange;
            }
        }
        
        // Handle relative date expressions
        if (timeRange.IsRelative && !string.IsNullOrEmpty(timeRange.RelativePeriod))
        {
            var now = DateTime.UtcNow;
            
            switch (timeRange.RelativePeriod.ToLower())
            {
                case "today":
                    timeRange.Start = now.ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "hourly";
                    break;
                    
                case "yesterday":
                    timeRange.Start = now.AddDays(-1).ToString("yyyy-MM-dd");
                    timeRange.End = now.AddDays(-1).ToString("yyyy-MM-dd");
                    timeRange.Period = "hourly";
                    break;
                    
                case "this_week":
                    var startOfWeek = now.AddDays(-(int)now.DayOfWeek);
                    timeRange.Start = startOfWeek.ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
                    
                case "last_week":
                    var startOfLastWeek = now.AddDays(-(int)now.DayOfWeek - 7);
                    var endOfLastWeek = now.AddDays(-(int)now.DayOfWeek - 1);
                    timeRange.Start = startOfLastWeek.ToString("yyyy-MM-dd");
                    timeRange.End = endOfLastWeek.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
                    
                case "this_month":
                    var startOfMonth = new DateTime(now.Year, now.Month, 1);
                    timeRange.Start = startOfMonth.ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
                    
                case "last_month":
                    var startOfLastMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
                    var endOfLastMonth = new DateTime(now.Year, now.Month, 1).AddDays(-1);
                    timeRange.Start = startOfLastMonth.ToString("yyyy-MM-dd");
                    timeRange.End = endOfLastMonth.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
                    
                case "last_30_days":
                    timeRange.Start = now.AddDays(-30).ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
                    
                case "last_90_days":
                    timeRange.Start = now.AddDays(-90).ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
                    
                case "this_quarter":
                    var currentQuarter = (now.Month - 1) / 3 + 1;
                    var startOfQuarter = new DateTime(now.Year, (currentQuarter - 1) * 3 + 1, 1);
                    timeRange.Start = startOfQuarter.ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "monthly";
                    break;
                    
                case "last_quarter":
                    var lastQuarter = (now.Month - 1) / 3;
                    if (lastQuarter == 0)
                    {
                        lastQuarter = 4;
                        var startOfLastQuarter = new DateTime(now.Year - 1, (lastQuarter - 1) * 3 + 1, 1);
                        var endOfLastQuarter = new DateTime(now.Year, 1, 1).AddDays(-1);
                        timeRange.Start = startOfLastQuarter.ToString("yyyy-MM-dd");
                        timeRange.End = endOfLastQuarter.ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        var startOfLastQuarter = new DateTime(now.Year, (lastQuarter - 1) * 3 + 1, 1);
                        var endOfLastQuarter = new DateTime(now.Year, lastQuarter * 3 + 1, 1).AddDays(-1);
                        timeRange.Start = startOfLastQuarter.ToString("yyyy-MM-dd");
                        timeRange.End = endOfLastQuarter.ToString("yyyy-MM-dd");
                    }
                    timeRange.Period = "monthly";
                    break;
                    
                case "this_year":
                    var startOfYear = new DateTime(now.Year, 1, 1);
                    timeRange.Start = startOfYear.ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "monthly";
                    break;
                    
                case "last_year":
                    var startOfLastYear = new DateTime(now.Year - 1, 1, 1);
                    var endOfLastYear = new DateTime(now.Year, 1, 1).AddDays(-1);
                    timeRange.Start = startOfLastYear.ToString("yyyy-MM-dd");
                    timeRange.End = endOfLastYear.ToString("yyyy-MM-dd");
                    timeRange.Period = "monthly";
                    break;
                    
                default:
                    _logger.LogWarning("Unrecognized relative time period: {Period}", timeRange.RelativePeriod);
                    // Default to last 30 days
                    timeRange.Start = now.AddDays(-30).ToString("yyyy-MM-dd");
                    timeRange.End = now.ToString("yyyy-MM-dd");
                    timeRange.Period = "daily";
                    break;
            }
        }
        
        return timeRange;
    }
    
    /// <summary>
    /// Records feedback about entity mappings to improve future performance
    /// </summary>
    public Task RecordMappingFeedbackAsync(string term, string mappedEntity, bool isCorrect, string? correction = null)
    {
        // In a real implementation, this would store feedback in a database to train the model
        _logger.LogInformation(
            "Mapping feedback received: Term={Term}, MappedTo={Entity}, Correct={IsCorrect}, Correction={Correction}",
            term, mappedEntity, isCorrect, correction ?? "null");
        
        return Task.CompletedTask;
    }
    
    /// <summary>
    /// Initialize the dictionary of gaming metrics with their database mappings
    /// </summary>
    private Dictionary<string, DbMetric> InitializeMetricMappings()
    {
        return new Dictionary<string, DbMetric>(StringComparer.OrdinalIgnoreCase)
        {
            ["revenue"] = new DbMetric 
            { 
                Name = "Revenue", 
                DatabaseField = "Transactions.Amount", 
                DefaultAggregation = "sum",
                Synonyms = new[] { "earnings", "income", "money", "sales" },
                DataType = "currency",
                FormatString = "£{0:N0}"
            },
            
            ["ggr"] = new DbMetric 
            { 
                Name = "GGR", 
                DatabaseField = "Games.GrossGamingRevenue", 
                DefaultAggregation = "sum",
                Synonyms = new[] { "gross gaming revenue", "gross revenue", "net gaming revenue", "net revenue" },
                DataType = "currency",
                FormatString = "£{0:N0}"
            },
            
            ["deposits"] = new DbMetric 
            { 
                Name = "Deposits", 
                DatabaseField = "Payments.DepositAmount", 
                DefaultAggregation = "sum",
                Synonyms = new[] { "deposit amount", "money in", "funds added" },
                DataType = "currency",
                FormatString = "£{0:N0}"
            },
            
            ["withdrawals"] = new DbMetric 
            { 
                Name = "Withdrawals", 
                DatabaseField = "Payments.WithdrawalAmount", 
                DefaultAggregation = "sum",
                Synonyms = new[] { "withdrawal amount", "money out", "cashouts" },
                DataType = "currency",
                FormatString = "£{0:N0}"
            },
            
            ["registrations"] = new DbMetric 
            { 
                Name = "Registrations", 
                DatabaseField = "Players.RegistrationDate", 
                DefaultAggregation = "count",
                Synonyms = new[] { "new players", "signups", "new registrations", "new accounts" },
                DataType = "number",
                FormatString = "{0:N0}"
            },
            
            ["active players"] = new DbMetric 
            { 
                Name = "Active Players", 
                DatabaseField = "Sessions.PlayerId", 
                DefaultAggregation = "distinct_count",
                Synonyms = new[] { "active users", "unique players", "players", "users" },
                DataType = "number",
                FormatString = "{0:N0}"
            },
            
            ["average bet"] = new DbMetric 
            { 
                Name = "Average Bet", 
                DatabaseField = "GameActivity.BetAmount", 
                DefaultAggregation = "avg",
                Synonyms = new[] { "avg bet", "mean bet", "bet average" },
                DataType = "currency",
                FormatString = "£{0:N2}"
            },
            
            ["rtp"] = new DbMetric 
            { 
                Name = "RTP", 
                DatabaseField = "Games.ReturnToPlayer", 
                DefaultAggregation = "avg",
                Synonyms = new[] { "return to player", "payback percentage", "payout percentage" },
                DataType = "percentage",
                FormatString = "{0:P2}"
            },
            
            ["wagering"] = new DbMetric 
            { 
                Name = "Wagering", 
                DatabaseField = "GameActivity.BetAmount", 
                DefaultAggregation = "sum",
                Synonyms = new[] { "total bets", "wagers", "bet amount", "turnover" },
                DataType = "currency",
                FormatString = "£{0:N0}"
            },
            
            ["arpu"] = new DbMetric 
            { 
                Name = "ARPU", 
                DatabaseField = "Players.Revenue", 
                DefaultAggregation = "avg",
                Synonyms = new[] { "average revenue per user", "average player value" },
                DataType = "currency",
                FormatString = "£{0:N2}"
            },
            
            ["retention rate"] = new DbMetric 
            { 
                Name = "Retention Rate", 
                DatabaseField = "PlayerMetrics.RetentionRate", 
                DefaultAggregation = "avg",
                Synonyms = new[] { "retention", "player retention", "stickiness" },
                DataType = "percentage",
                FormatString = "{0:P2}"
            },
            
            ["rounds played"] = new DbMetric 
            { 
                Name = "Rounds Played", 
                DatabaseField = "GameActivity.RoundId", 
                DefaultAggregation = "count",
                Synonyms = new[] { "game rounds", "spins", "hands played", "bets placed" },
                DataType = "number",
                FormatString = "{0:N0}"
            }
        };
    }
    
    /// <summary>
    /// Initialize the dictionary of gaming dimensions with their database mappings
    /// </summary>
    private Dictionary<string, DbDimension> InitializeDimensionMappings()
    {
        return new Dictionary<string, DbDimension>(StringComparer.OrdinalIgnoreCase)
        {
            ["game"] = new DbDimension 
            { 
                Name = "Game", 
                DatabaseField = "Games.GameName",
                Synonyms = new[] { "game name", "game title", "slot", "table game" }
            },
            
            ["game type"] = new DbDimension 
            { 
                Name = "Game Type", 
                DatabaseField = "Games.GameType",
                Synonyms = new[] { "game category", "type", "category" },
                AllowedValues = new Dictionary<string, string>
                {
                    ["slots"] = "Slots",
                    ["table games"] = "Table Games",
                    ["live dealer"] = "Live Dealer",
                    ["poker"] = "Poker",
                    ["bingo"] = "Bingo",
                    ["scratch cards"] = "Scratch Cards"
                }
            },
            
            ["provider"] = new DbDimension 
            { 
                Name = "Provider", 
                DatabaseField = "Games.ProviderName",
                Synonyms = new[] { "game provider", "vendor", "supplier", "game studio" }
            },
            
            ["country"] = new DbDimension 
            { 
                Name = "Country", 
                DatabaseField = "Players.Country",
                Synonyms = new[] { "player country", "location", "region", "geo" }
            },
            
            ["white label"] = new DbDimension 
            { 
                Name = "White Label", 
                DatabaseField = "WhiteLabels.Name",
                Synonyms = new[] { "brand", "site", "casino brand", "skin" }
            },
            
            ["partner"] = new DbDimension 
            { 
                Name = "Partner", 
                DatabaseField = "Partners.Name",
                Synonyms = new[] { "operator", "client", "b2b client" }
            },
            
            ["device"] = new DbDimension 
            { 
                Name = "Device", 
                DatabaseField = "Sessions.DeviceType",
                Synonyms = new[] { "device type", "platform", "mobile/desktop" },
                AllowedValues = new Dictionary<string, string>
                {
                    ["desktop"] = "Desktop",
                    ["mobile"] = "Mobile",
                    ["tablet"] = "Tablet"
                }
            },
            
            ["payment method"] = new DbDimension 
            { 
                Name = "Payment Method", 
                DatabaseField = "Payments.MethodName",
                Synonyms = new[] { "payment type", "deposit method", "payment provider" }
            },
            
            ["campaign"] = new DbDimension 
            { 
                Name = "Campaign", 
                DatabaseField = "Marketing.CampaignName",
                Synonyms = new[] { "marketing campaign", "promotion", "offer" }
            },
            
            ["player segment"] = new DbDimension 
            { 
                Name = "Player Segment", 
                DatabaseField = "Players.Segment",
                Synonyms = new[] { "segment", "player type", "user segment", "player category" },
                AllowedValues = new Dictionary<string, string>
                {
                    ["vip"] = "VIP",
                    ["high roller"] = "High Roller",
                    ["regular"] = "Regular",
                    ["casual"] = "Casual",
                    ["inactive"] = "Inactive",
                    ["new"] = "New"
                }
            }
        };
    }
    
    /// <summary>
    /// Calculate similarity between two strings (simplified implementation)
    /// </summary>
    private double CalculateSimilarity(string source, string target)
    {
        // This is a very simplified implementation
        // In a real-world scenario, you would use a more sophisticated algorithm
        // like Levenshtein distance, Jaro-Winkler, etc.
        
        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target))
            return 0;
            
        if (source == target)
            return 1;
            
        // Check if one is contained in the other
        if (source.Contains(target) || target.Contains(source))
            return 0.8;
            
        // Count matching words
        var sourceWords = source.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var targetWords = target.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        var matchingWords = sourceWords.Intersect(targetWords, StringComparer.OrdinalIgnoreCase).Count();
        var totalWords = Math.Max(sourceWords.Length, targetWords.Length);
        
        return totalWords > 0 ? (double)matchingWords / totalWords : 0;
    }
}