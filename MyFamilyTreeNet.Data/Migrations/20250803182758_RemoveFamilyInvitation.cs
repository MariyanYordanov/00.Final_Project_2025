using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyFamilyTreeNet.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFamilyInvitation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FamilyInvitations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FamilyInvitations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FamilyId = table.Column<int>(type: "INTEGER", nullable: false),
                    InvitedByUserId = table.Column<string>(type: "TEXT", nullable: false),
                    InvitedUserId = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    InvitedEmail = table.Column<string>(type: "TEXT", nullable: false),
                    Message = table.Column<string>(type: "TEXT", nullable: true),
                    RespondedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyInvitations_AspNetUsers_InvitedByUserId",
                        column: x => x.InvitedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FamilyInvitations_AspNetUsers_InvitedUserId",
                        column: x => x.InvitedUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyInvitations_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvitations_FamilyId",
                table: "FamilyInvitations",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvitations_InvitedByUserId",
                table: "FamilyInvitations",
                column: "InvitedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvitations_InvitedUserId",
                table: "FamilyInvitations",
                column: "InvitedUserId");
        }
    }
}
