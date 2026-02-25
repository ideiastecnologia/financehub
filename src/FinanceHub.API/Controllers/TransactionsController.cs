using System.Security.Claims;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using FinanceHub.API.Hubs;

namespace FinanceHub.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IHubContext<DashboardHub> _hubContext;

    public TransactionsController(ITransactionService transactionService, IHubContext<DashboardHub> hubContext)
    {
        _transactionService = transactionService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TransactionDto>>> GetAll([FromQuery] TransactionFilterDto filter)
        => Ok(await _transactionService.GetAllAsync(GetUserId(), filter));

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(Guid id)
        => Ok(await _transactionService.GetByIdAsync(GetUserId(), id));

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto)
    {
        var userId = GetUserId();
        var result = await _transactionService.CreateAsync(userId, dto);

        // Notify dashboard via SignalR
        await _hubContext.Clients.Group($"dashboard_{userId}").SendAsync("TransactionCreated", result);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(Guid id, [FromBody] UpdateTransactionDto dto)
    {
        var userId = GetUserId();
        var result = await _transactionService.UpdateAsync(userId, id, dto);
        await _hubContext.Clients.Group($"dashboard_{userId}").SendAsync("TransactionUpdated", result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        await _transactionService.DeleteAsync(userId, id);
        await _hubContext.Clients.Group($"dashboard_{userId}").SendAsync("TransactionDeleted", id);
        return NoContent();
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryDto>> GetSummary([FromQuery] string period = "month")
        => Ok(await _transactionService.GetSummaryAsync(GetUserId(), period));

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
