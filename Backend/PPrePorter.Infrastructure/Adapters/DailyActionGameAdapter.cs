using CoreDailyActionGame = PPrePorter.Domain.Entities.PPReporter.DailyActionGame;
using DbDailyActionGame = PPrePorter.DailyActionsDB.Models.DailyActions.DailyActionGame;

namespace PPrePorter.Infrastructure.Adapters
{
    /// <summary>
    /// Adapter for converting between Domain.Entities.PPReporter.DailyActionGame and DailyActionsDB.Models.DailyActions.DailyActionGame
    /// </summary>
    public static class DailyActionGameAdapter
    {
        /// <summary>
        /// Converts a DailyActionsDB.Models.DailyActions.DailyActionGame to Domain.Entities.PPReporter.DailyActionGame
        /// </summary>
        public static CoreDailyActionGame ToCore(this DbDailyActionGame dbDailyActionGame)
        {
            // Calculate the number of rounds based on available data
            // In the DB model, there's no direct RoundCount property, so we'll use NumberofRealBets or NumberofBonusBets if available
            int? roundCount = null;
            if (dbDailyActionGame.NumberofRealBets.HasValue)
            {
                roundCount = (int)dbDailyActionGame.NumberofRealBets.Value;
            }
            else if (dbDailyActionGame.NumberofBonusBets.HasValue)
            {
                roundCount = (int)dbDailyActionGame.NumberofBonusBets.Value;
            }

            return new CoreDailyActionGame
            {
                Id = (int)dbDailyActionGame.ID,
                GameId = dbDailyActionGame.GameID.HasValue ? (int)dbDailyActionGame.GameID.Value : 0,
                PlayerID = dbDailyActionGame.PlayerID.HasValue ? (int)dbDailyActionGame.PlayerID.Value : 0,
                WhiteLabelId = 0, // Not available in DbDailyActionGame
                RealBetAmount = dbDailyActionGame.RealBetAmount,
                BonusBetAmount = dbDailyActionGame.BonusBetAmount,
                RealWinAmount = dbDailyActionGame.RealWinAmount,
                BonusWinAmount = dbDailyActionGame.BonusWinAmount,
                GameDate = dbDailyActionGame.GameDate ?? System.DateTime.MinValue,
                Revenue = dbDailyActionGame.RealBetAmount - dbDailyActionGame.RealWinAmount,
                RoundCount = roundCount,
                Bets = dbDailyActionGame.RealBetAmount + dbDailyActionGame.BonusBetAmount,
                Wins = dbDailyActionGame.RealWinAmount + dbDailyActionGame.BonusWinAmount
            };
        }

        /// <summary>
        /// Converts a Domain.Entities.PPReporter.DailyActionGame to DailyActionsDB.Models.DailyActions.DailyActionGame
        /// </summary>
        public static DbDailyActionGame ToDb(this CoreDailyActionGame coreDailyActionGame)
        {
            return new DbDailyActionGame
            {
                ID = coreDailyActionGame.Id,
                GameID = coreDailyActionGame.GameId,
                PlayerID = coreDailyActionGame.PlayerID,
                GameDate = coreDailyActionGame.GameDate,
                RealBetAmount = coreDailyActionGame.RealBetAmount,
                BonusBetAmount = coreDailyActionGame.BonusBetAmount,
                RealWinAmount = coreDailyActionGame.RealWinAmount,
                BonusWinAmount = coreDailyActionGame.BonusWinAmount,
                // Store RoundCount in NumberofRealBets if available
                NumberofRealBets = coreDailyActionGame.RoundCount.HasValue ? (decimal)coreDailyActionGame.RoundCount.Value : null
            };
        }
    }
}
