using System.Security.Claims;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceHub.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetsController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BudgetDto>>> GetAll()
        => Ok(await _budgetService.GetAllAsync(GetUserId()));

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetById(Guid id)
        => Ok(await _budgetService.GetByIdAsync(GetUserId(), id));

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> Create([FromBody] CreateBudgetDto dto)
    {
        var result = await _budgetService.CreateAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> Update(Guid id, [FromBody] UpdateBudgetDto dto)
        => Ok(await _budgetService.UpdateAsync(GetUserId(), id, dto));

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _budgetService.DeleteAsync(GetUserId(), id);
        return NoContent();
    }

    [HttpGet("overview")]
    public async Task<ActionResult<BudgetOverviewDto>> GetOverview([FromQuery] int month, [FromQuery] int year)
        => Ok(await _budgetService.GetOverviewAsync(GetUserId(), month, year));

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
