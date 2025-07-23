using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace TheBackend.DynamicModels
{
    public class Comment
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string Content { get; set; }
        public Post? Post { get; set; }
    }
}
