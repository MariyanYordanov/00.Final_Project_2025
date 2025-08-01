using AutoMapper;
using WorldFamily.Data.Models;
using WorldFamily.Api.DTOs;

namespace WorldFamily.Api.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));

            // Family mappings
            CreateMap<Family, FamilyDto>()
                .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.FamilyMembers != null ? src.FamilyMembers.Count : 0))
                .ForMember(dest => dest.PhotoCount, opt => opt.MapFrom(src => src.Photos != null ? src.Photos.Count : 0))
                .ForMember(dest => dest.StoryCount, opt => opt.MapFrom(src => src.Stories != null ? src.Stories.Count : 0));
            CreateMap<CreateFamilyDto, Family>();
            CreateMap<UpdateFamilyDto, Family>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Family Member mappings
            CreateMap<FamilyMember, FamilyMemberDto>()
                .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Family.Name))
                .ForMember(dest => dest.Age, opt => opt.MapFrom(src => CalculateAge(src.DateOfBirth, src.DateOfDeath)));
            CreateMap<CreateMemberDto, FamilyMember>();
            CreateMap<UpdateMemberDto, FamilyMember>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Relationship mappings
            CreateMap<Relationship, RelationshipDto>()
                .ForMember(dest => dest.PrimaryMemberName, opt => opt.MapFrom(src => 
                    src.PrimaryMember != null ? $"{src.PrimaryMember.FirstName} {src.PrimaryMember.MiddleName} {src.PrimaryMember.LastName}".Trim() : ""))
                .ForMember(dest => dest.RelatedMemberName, opt => opt.MapFrom(src => 
                    src.RelatedMember != null ? $"{src.RelatedMember.FirstName} {src.RelatedMember.MiddleName} {src.RelatedMember.LastName}".Trim() : ""));
            CreateMap<CreateRelationshipDto, Relationship>();
            CreateMap<UpdateRelationshipDto, Relationship>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Photo mappings
            CreateMap<Photo, PhotoDto>()
                .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Family.Name))
                .ForMember(dest => dest.UploadedByName, opt => opt.MapFrom(src => $"{src.UploadedBy.FirstName} {src.UploadedBy.MiddleName} {src.UploadedBy.LastName}"))
                .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => src.Likes.Count))
                .ForMember(dest => dest.TaggedMembers, opt => opt.MapFrom(src => src.Tags.Select(t => new TaggedMemberDto
                {
                    MemberId = t.FamilyMemberId,
                    MemberName = $"{t.FamilyMember.FirstName} {t.FamilyMember.MiddleName} {t.FamilyMember.LastName}"
                })));

            // Story mappings
            CreateMap<Story, StoryDto>()
                .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Family.Name))
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => $"{src.Author.FirstName} {src.Author.MiddleName} {src.Author.LastName}"))
                .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => src.Likes.Count))
                .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count));

            // Like mappings
            CreateMap<PhotoLike, PhotoLikeDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.MiddleName} {src.User.LastName}"));
            CreateMap<StoryLike, StoryLikeDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.MiddleName} {src.User.LastName}"));
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