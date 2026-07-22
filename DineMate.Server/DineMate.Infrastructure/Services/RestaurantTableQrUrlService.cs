using DineMate.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Services
{
    public class RestaurantTableQrUrlService
       : IRestaurantTableQrUrlService
    {
        private readonly IConfiguration
            _configuration;

        public RestaurantTableQrUrlService(
            IConfiguration configuration
        )
        {
            _configuration = configuration;
        }

        public string GenerateOrderUrl(
            string restaurantTableId
        )
        {
            var frontendBaseUrl =
                _configuration[
                    "Frontend:BaseUrl"
                ];

            /*
             * Nếu appsettings chưa có cấu hình
             * thì dùng URL Angular mặc định.
             */
            if (
                string.IsNullOrWhiteSpace(
                    frontendBaseUrl
                )
            )
            {
                frontendBaseUrl =
                    "http://localhost:4200";
            }

            frontendBaseUrl =
                frontendBaseUrl.TrimEnd('/');

            var encodedTableId =
                Uri.EscapeDataString(
                    restaurantTableId
                );

            return
                $"{frontendBaseUrl}/order/{encodedTableId}";
        }
    }
}
