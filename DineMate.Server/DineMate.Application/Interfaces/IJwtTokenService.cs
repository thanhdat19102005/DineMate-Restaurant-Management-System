using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Interfaces
{
    public interface IJwtTokenService
    {
        string CreateToken(
            string userId,
            string fullName,
            string userName,
            string email,
            IList<string> roles,
            DateTime expiresAt
        );
    }
}
