using System.Security.Claims;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceHub.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goalService;

    public GoalsController(IGoalService goalService)
    {
        _goalService = goalService;
    }

    [HttpGet]
    public async Task<ActionResult<List<GoalDto>>> GetAll()
        => Ok(await _goalService.GetAllAsync(GetUserId()));

    [HttpGet("{id}")]
    public async Task<ActionResult<GoalDto>> GetById(Guid id)
        => Ok(await _goalService.GetByIdAsync(GetUserId(), id));

    [HttpPost]
    public async Task<ActionResult<GoalDto>> Create([FromBody] CreateGoalDto dto)
    {
        var result = await _goalService.CreateAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GoalDto>> Update(Guid id, [FromBody] UpdateGoalDto dto)
        => Ok(await _goalService.UpdateAsync(GetUserId(), id, dto));

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _goalService.DeleteAsync(GetUserId(), id);
        return NoContent();
    }

    [HttpPost("{id}/contribute")]
    public async Task<ActionResult<GoalDto>> Contribute(Guid id, [FromBody] ContributeGoalDto dto)
        => Ok(await _goalService.ContributeAsync(GetUserId(), id, dto));

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
