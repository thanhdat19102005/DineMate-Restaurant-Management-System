using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Interfaces
{
    /*
    * Application chỉ biết interface.
    *
    * Infrastructure sẽ triển khai việc
    * đọc URL frontend từ appsettings.json.
    */
    public interface
        IRestaurantTableQrUrlService
    {
        string GenerateOrderUrl(
            string restaurantTableId
        );
    }
}
