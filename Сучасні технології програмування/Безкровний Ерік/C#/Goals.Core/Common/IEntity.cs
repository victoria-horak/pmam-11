using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Goals.Core.Common
{
    public interface IEntity<TKey> where TKey : struct
    {
        [Key]
        TKey Id { get; set; }

    }
}
