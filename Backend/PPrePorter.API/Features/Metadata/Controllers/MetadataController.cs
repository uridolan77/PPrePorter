using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Interfaces;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Models.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPrePorter.API.Features.Metadata.Controllers
{
    [ApiController]
    [Route("api/metadata")]
    [Authorize]
    [Produces("application/json")]
    [ApiExplorerSettings(GroupName = "Metadata")]
    public class MetadataController : ControllerBase
    {
        private readonly IWhiteLabelService _whiteLabelService;
        private readonly ICountryService _countryService;
        private readonly ICurrencyService _currencyService;
        private readonly ILogger<MetadataController> _logger;

        public MetadataController(
            IWhiteLabelService whiteLabelService,
            ICountryService countryService,
            ICurrencyService currencyService,
            ILogger<MetadataController> logger)
        {
            _whiteLabelService = whiteLabelService ?? throw new ArgumentNullException(nameof(whiteLabelService));
            _countryService = countryService ?? throw new ArgumentNullException(nameof(countryService));
            _currencyService = currencyService ?? throw new ArgumentNullException(nameof(currencyService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get all white labels
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive white labels (default: false)</param>
        /// <returns>List of white labels</returns>
        /// <response code="200">Returns the list of white labels</response>
        /// <response code="500">If there was an error retrieving the white labels</response>
        [HttpGet("white-labels")]
        [ProducesResponseType(typeof(IEnumerable<WhiteLabelDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetWhiteLabels([FromQuery] bool includeInactive = false)
        {
            try
            {
                var whiteLabels = await _whiteLabelService.GetAllWhiteLabelsAsync(includeInactive);

                var result = whiteLabels.Select(wl => new WhiteLabelDto
                {
                    Id = wl.Id,
                    Name = wl.Name,
                    Code = wl.Code,
                    IsActive = wl.IsActive ?? false
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving white labels");
                return StatusCode(500, new { message = "An error occurred while retrieving white labels" });
            }
        }

        /// <summary>
        /// Get white label by ID
        /// </summary>
        /// <param name="id">White label ID</param>
        /// <returns>White label details</returns>
        /// <response code="200">Returns the white label</response>
        /// <response code="404">If the white label is not found</response>
        /// <response code="500">If there was an error retrieving the white label</response>
        [HttpGet("white-labels/{id}")]
        [ProducesResponseType(typeof(WhiteLabelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetWhiteLabelById(int id)
        {
            try
            {
                var whiteLabel = await _whiteLabelService.GetWhiteLabelByIdAsync(id);

                if (whiteLabel == null)
                {
                    return NotFound(new { message = $"White label with ID {id} not found" });
                }

                var result = new WhiteLabelDto
                {
                    Id = whiteLabel.Id,
                    Name = whiteLabel.Name,
                    Code = whiteLabel.Code,
                    IsActive = whiteLabel.IsActive ?? false
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving white label with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the white label" });
            }
        }

        /// <summary>
        /// Get all countries
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive countries (default: false)</param>
        /// <returns>List of countries</returns>
        /// <response code="200">Returns the list of countries</response>
        /// <response code="500">If there was an error retrieving the countries</response>
        [HttpGet("countries")]
        [ProducesResponseType(typeof(IEnumerable<CountryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCountries([FromQuery] bool includeInactive = false)
        {
            try
            {
                var countries = await _countryService.GetAllCountriesAsync(includeInactive);

                var result = countries.Select(c => new CountryDto
                {
                    Id = c.CountryID,
                    Name = c.CountryName,
                    IsoCode = c.IsoCode
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving countries");
                return StatusCode(500, new { message = "An error occurred while retrieving countries" });
            }
        }

        /// <summary>
        /// Get country by ID
        /// </summary>
        /// <param name="id">Country ID</param>
        /// <returns>Country details</returns>
        /// <response code="200">Returns the country</response>
        /// <response code="404">If the country is not found</response>
        /// <response code="500">If there was an error retrieving the country</response>
        [HttpGet("countries/{id}")]
        [ProducesResponseType(typeof(CountryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCountryById(int id)
        {
            try
            {
                var country = await _countryService.GetCountryByIdAsync(id);

                if (country == null)
                {
                    return NotFound(new { message = $"Country with ID {id} not found" });
                }

                var result = new CountryDto
                {
                    Id = country.CountryID,
                    Name = country.CountryName,
                    IsoCode = country.IsoCode
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving country with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the country" });
            }
        }

        /// <summary>
        /// Get all currencies
        /// </summary>
        /// <returns>List of currencies</returns>
        /// <response code="200">Returns the list of currencies</response>
        /// <response code="500">If there was an error retrieving the currencies</response>
        [HttpGet("currencies")]
        [ProducesResponseType(typeof(IEnumerable<CurrencyDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCurrencies()
        {
            try
            {
                var currencies = await _currencyService.GetAllCurrenciesAsync();

                var result = currencies.Select(c => new CurrencyDto
                {
                    Id = c.CurrencyID,
                    Name = c.CurrencyName,
                    Code = c.CurrencyCode,
                    Symbol = c.CurrencySymbol
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving currencies");
                return StatusCode(500, new { message = "An error occurred while retrieving currencies" });
            }
        }

        /// <summary>
        /// Get currency by ID
        /// </summary>
        /// <param name="id">Currency ID</param>
        /// <returns>Currency details</returns>
        /// <response code="200">Returns the currency</response>
        /// <response code="404">If the currency is not found</response>
        /// <response code="500">If there was an error retrieving the currency</response>
        [HttpGet("currencies/{id}")]
        [ProducesResponseType(typeof(CurrencyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCurrencyById(byte id)
        {
            try
            {
                var currency = await _currencyService.GetCurrencyByIdAsync(id);

                if (currency == null)
                {
                    return NotFound(new { message = $"Currency with ID {id} not found" });
                }

                var result = new CurrencyDto
                {
                    Id = currency.CurrencyID,
                    Name = currency.CurrencyName,
                    Code = currency.CurrencyCode,
                    Symbol = currency.CurrencySymbol
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving currency with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the currency" });
            }
        }

        /// <summary>
        /// Get all metadata (white labels, countries, currencies) in a single call
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive entities (default: false)</param>
        /// <returns>All metadata including white labels, countries, and currencies</returns>
        /// <response code="200">Returns all metadata</response>
        /// <response code="500">If there was an error retrieving the metadata</response>
        [HttpGet("all")]
        [ProducesResponseType(typeof(MetadataResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllMetadata([FromQuery] bool includeInactive = false)
        {
            try
            {
                // Get all metadata in parallel
                var whiteLabelsTask = _whiteLabelService.GetAllWhiteLabelsAsync(includeInactive);
                var countriesTask = _countryService.GetAllCountriesAsync(includeInactive);
                var currenciesTask = _currencyService.GetAllCurrenciesAsync();

                await Task.WhenAll(whiteLabelsTask, countriesTask, currenciesTask);

                var whiteLabels = whiteLabelsTask.Result;
                var countries = countriesTask.Result;
                var currencies = currenciesTask.Result;

                // Map to DTOs
                var whiteLabelDtos = whiteLabels.Select(wl => new WhiteLabelDto
                {
                    Id = wl.Id,
                    Name = wl.Name,
                    Code = wl.Code,
                    IsActive = wl.IsActive ?? false
                }).ToList();

                var countryDtos = countries.Select(c => new CountryDto
                {
                    Id = c.CountryID,
                    Name = c.CountryName,
                    IsoCode = c.IsoCode
                }).ToList();

                var currencyDtos = currencies.Select(c => new CurrencyDto
                {
                    Id = c.CurrencyID,
                    Name = c.CurrencyName,
                    Code = c.CurrencyCode,
                    Symbol = c.CurrencySymbol
                }).ToList();

                // Create response
                var result = new MetadataResponseDto
                {
                    WhiteLabels = whiteLabelDtos,
                    Countries = countryDtos,
                    Currencies = currencyDtos
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all metadata");
                return StatusCode(500, new { message = "An error occurred while retrieving metadata" });
            }
        }
    }
}
