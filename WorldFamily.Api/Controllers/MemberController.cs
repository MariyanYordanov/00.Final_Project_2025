using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorldFamily.Api.Contracts;
using WorldFamily.Api.DTOs;
using WorldFamily.Data.Models;

namespace WorldFamily.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly IMapper _mapper;

        public MemberController(IMemberService memberService, IMapper mapper)
        {
            _memberService = memberService;
            _mapper = mapper;
        }

        [HttpGet("family/{familyId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFamilyMembers(int familyId)
        {
            var members = await _memberService.GetFamilyMembersAsync(familyId);
            var memberDtos = members.Select(m => new FamilyMemberDto
            {
                Id = m.Id,
                FirstName = m.FirstName,
                MiddleName = m.MiddleName,
                LastName = m.LastName,
                DateOfBirth = m.DateOfBirth,
                DateOfDeath = m.DateOfDeath,
                Gender = m.Gender.ToString(),
                Biography = m.Biography,
                PlaceOfBirth = m.PlaceOfBirth,
                PlaceOfDeath = m.PlaceOfDeath,
                FamilyId = m.FamilyId,
                FamilyName = m.Family?.Name ?? "",
                Age = CalculateAge(m.DateOfBirth, m.DateOfDeath)
            });
            return Ok(memberDtos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMember(int id)
        {
            var member = await _memberService.GetMemberByIdAsync(id);
            if (member == null)
                return NotFound();

            var memberDto = new FamilyMemberDto
            {
                Id = member.Id,
                FirstName = member.FirstName,
                MiddleName = member.MiddleName,
                LastName = member.LastName,
                DateOfBirth = member.DateOfBirth,
                DateOfDeath = member.DateOfDeath,
                Gender = member.Gender.ToString(),
                Biography = member.Biography,
                PlaceOfBirth = member.PlaceOfBirth,
                PlaceOfDeath = member.PlaceOfDeath,
                FamilyId = member.FamilyId,
                FamilyName = member.Family?.Name ?? "",
                Age = CalculateAge(member.DateOfBirth, member.DateOfDeath)
            };
            return Ok(memberDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMember([FromBody] CreateMemberDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var member = new FamilyMember
            {
                FirstName = model.FirstName,
                MiddleName = model.MiddleName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth,
                DateOfDeath = model.DateOfDeath,
                Gender = Enum.TryParse<Gender>(model.Gender, out var gender) ? gender : Gender.Unknown,
                Biography = model.Biography,
                PlaceOfBirth = model.PlaceOfBirth,
                PlaceOfDeath = model.PlaceOfDeath,
                FamilyId = model.FamilyId
            };

            var createdMember = await _memberService.CreateMemberAsync(member);
            var memberDto = new FamilyMemberDto
            {
                Id = createdMember.Id,
                FirstName = createdMember.FirstName,
                MiddleName = createdMember.MiddleName,
                LastName = createdMember.LastName,
                DateOfBirth = createdMember.DateOfBirth,
                DateOfDeath = createdMember.DateOfDeath,
                Gender = createdMember.Gender.ToString(),
                Biography = createdMember.Biography,
                PlaceOfBirth = createdMember.PlaceOfBirth,
                PlaceOfDeath = createdMember.PlaceOfDeath,
                FamilyId = createdMember.FamilyId,
                FamilyName = "",
                Age = CalculateAge(createdMember.DateOfBirth, createdMember.DateOfDeath)
            };
            return CreatedAtAction(nameof(GetMember), new { id = createdMember.Id }, memberDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, [FromBody] UpdateMemberDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var member = new FamilyMember
            {
                Id = id,
                FirstName = model.FirstName,
                MiddleName = model.MiddleName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth,
                DateOfDeath = model.DateOfDeath,
                Gender = Enum.TryParse<Gender>(model.Gender, out var updateGender) ? updateGender : Gender.Unknown,
                Biography = model.Biography,
                PlaceOfBirth = model.PlaceOfBirth,
                PlaceOfDeath = model.PlaceOfDeath
            };

            var updatedMember = await _memberService.UpdateMemberAsync(id, member);
            if (updatedMember == null)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var success = await _memberService.DeleteMemberAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        private static int? CalculateAge(DateTime? birthDate, DateTime? deathDate)
        {
            if (!birthDate.HasValue)
                return null;

            var endDate = deathDate ?? DateTime.Today;
            var age = endDate.Year - birthDate.Value.Year;
            
            if (endDate.Date < birthDate.Value.Date.AddYears(age))
                age--;

            return age;
        }
    }
}