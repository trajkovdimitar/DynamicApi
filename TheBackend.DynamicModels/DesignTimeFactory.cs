using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace TheBackend.DynamicModels
{
    public class DesignTimeFactory : IDesignTimeDbContextFactory<DynamicDbContext>
    {
        public DynamicDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DynamicDbContext>();
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=DynamicDb;Trusted_Connection=True;");
            return new DynamicDbContext(optionsBuilder.Options);
        }
    }
}