using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;
using FinanceHub.Domain.Interfaces;

namespace FinanceHub.Application.Services;

public class GoalService : IGoalService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GoalService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GoalDto>> GetAllAsync(Guid userId)
    {
        var goals = await _unitOfWork.Repository<Goal>().FindAsync(g => g.UserId == userId);
        return _mapper.Map<List<GoalDto>>(goals);
    }

    public async Task<GoalDto> GetByIdAsync(Guid userId, Guid id)
    {
        var goal = await _unitOfWork.Repository<Goal>().GetByIdAsync(id);
        if (goal == null || goal.UserId != userId)
            throw new KeyNotFoundException("Goal not found.");
        return _mapper.Map<GoalDto>(goal);
    }

    public async Task<GoalDto> CreateAsync(Guid userId, CreateGoalDto dto)
    {
        var goal = _mapper.Map<Goal>(dto);
        goal.UserId = userId;
        await _unitOfWork.Repository<Goal>().AddAsync(goal);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<GoalDto>(goal);
    }

    public async Task<GoalDto> UpdateAsync(Guid userId, Guid id, UpdateGoalDto dto)
    {
        var goal = await _unitOfWork.Repository<Goal>().GetByIdAsync(id);
        if (goal == null || goal.UserId != userId)
            throw new KeyNotFoundException("Goal not found.");

        goal.Name = dto.Name;
        goal.TargetAmount = dto.TargetAmount;
        goal.Deadline = dto.Deadline;
        goal.Color = dto.Color;
        goal.Icon = dto.Icon;
        goal.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Goal>().UpdateAsync(goal);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<GoalDto>(goal);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var goal = await _unitOfWork.Repository<Goal>().GetByIdAsync(id);
        if (goal == null || goal.UserId != userId)
            throw new KeyNotFoundException("Goal not found.");
        await _unitOfWork.Repository<Goal>().DeleteAsync(goal);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<GoalDto> ContributeAsync(Guid userId, Guid id, ContributeGoalDto dto)
    {
        var goal = await _unitOfWork.Repository<Goal>().GetByIdAsync(id);
        if (goal == null || goal.UserId != userId)
            throw new KeyNotFoundException("Goal not found.");

        goal.CurrentAmount += dto.Amount;
        if (goal.CurrentAmount >= goal.TargetAmount)
            goal.Status = GoalStatus.Completed;
        goal.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Goal>().UpdateAsync(goal);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<GoalDto>(goal);
    }
}
