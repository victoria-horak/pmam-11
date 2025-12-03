using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Goals.Core.Common
{
    public interface INamedEntity<TKey> : IEntity<TKey> where TKey : struct
    {

    }
}
