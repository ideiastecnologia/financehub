using System.Security.Claims;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceHub.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlyReportDto>> GetMonthly([FromQuery] int year, [FromQuery] int month)
        => Ok(await _reportService.GetMonthlyReportAsync(GetUserId(), year, month));

    [HttpGet("yearly")]
    public async Task<ActionResult<YearlyReportDto>> GetYearly([FromQuery] int year)
        => Ok(await _reportService.GetYearlyReportAsync(GetUserId(), year));

    [HttpGet("category-breakdown")]
    public async Task<ActionResult<List<CategoryBreakdownDto>>> GetCategoryBreakdown([FromQuery] string period = "month")
        => Ok(await _reportService.GetCategoryBreakdownAsync(GetUserId(), period));

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
