using Goals.Core.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Goals.Core.Entities
{
    public class Goal : INamedEntity<Guid>
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Season { get; set; }
        public string Competition { get; set; }
        public string Matchday { get; set; }
        public DateTime Date { get; set; }
        public string Venue { get; set; }
        public string Club { get; set; }
        public string Opponent { get; set; }
        public string Result { get; set; }
        public string? Playing_Position { get; set; }
        public string Minute { get; set; }
        public string At_score { get; set; }
        public string? Type { get; set; }
        public string? Goal_assist { get; set; }
    }
}
