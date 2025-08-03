using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyFamilyTreeNet.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBioToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyMembers_AspNetUsers_LinkedUserId",
                table: "FamilyMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_PhotoTags_AspNetUsers_TaggedByUserId",
                table: "PhotoTags");

            migrationBuilder.DropForeignKey(
                name: "FK_PhotoTags_Photos_PhotoId1",
                table: "PhotoTags");

            migrationBuilder.DropIndex(
                name: "IX_PhotoTags_PhotoId1",
                table: "PhotoTags");

            migrationBuilder.DropIndex(
                name: "IX_PhotoTags_TaggedByUserId",
                table: "PhotoTags");

            migrationBuilder.DropColumn(
                name: "CoverImageUrl",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "StoryType",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "PhotoId1",
                table: "PhotoTags");

            migrationBuilder.DropColumn(
                name: "PositionX",
                table: "PhotoTags");

            migrationBuilder.DropColumn(
                name: "PositionY",
                table: "PhotoTags");

            migrationBuilder.DropColumn(
                name: "TaggedByUserId",
                table: "PhotoTags");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "Photos");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Photos");

            migrationBuilder.DropColumn(
                name: "CanComment",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "CanInvite",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "CanPost",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "FamilyTreeImageUrl",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "LinkedUserId",
                table: "FamilyMembers",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_FamilyMembers_LinkedUserId",
                table: "FamilyMembers",
                newName: "IX_FamilyMembers_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyMembers_AspNetUsers_UserId",
                table: "FamilyMembers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyMembers_AspNetUsers_UserId",
                table: "FamilyMembers");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "FamilyMembers",
                newName: "LinkedUserId");

            migrationBuilder.RenameIndex(
                name: "IX_FamilyMembers_UserId",
                table: "FamilyMembers",
                newName: "IX_FamilyMembers_LinkedUserId");

            migrationBuilder.AddColumn<string>(
                name: "CoverImageUrl",
                table: "Stories",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StoryType",
                table: "Stories",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Stories",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "PhotoId1",
                table: "PhotoTags",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PositionX",
                table: "PhotoTags",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PositionY",
                table: "PhotoTags",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TaggedByUserId",
                table: "PhotoTags",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Photos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Photos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "CanComment",
                table: "FamilyMembers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CanInvite",
                table: "FamilyMembers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CanPost",
                table: "FamilyMembers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "FamilyMembers",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "FamilyMembers",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "FamilyMembers",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FamilyTreeImageUrl",
                table: "Families",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Families",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhotoTags_PhotoId1",
                table: "PhotoTags",
                column: "PhotoId1");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoTags_TaggedByUserId",
                table: "PhotoTags",
                column: "TaggedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyMembers_AspNetUsers_LinkedUserId",
                table: "FamilyMembers",
                column: "LinkedUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PhotoTags_AspNetUsers_TaggedByUserId",
                table: "PhotoTags",
                column: "TaggedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PhotoTags_Photos_PhotoId1",
                table: "PhotoTags",
                column: "PhotoId1",
                principalTable: "Photos",
                principalColumn: "Id");
        }
    }
}
