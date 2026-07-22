using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class RestaurantTableManagementDto
    {
        public RestaurantTableStatisticsDto Statistics
        {
            get;
            set;
        } = new();

        public PagedRestaurantTableDto Tables
        {
            get;
            set;
        } = new();

        public RestaurantTableDetailDto? SelectedTable
        {
            get;
            set;
        }

        public List<RestaurantTableHistoryDto> Histories
        {
            get;
            set;
        } = new();

        public List<string> Areas
        {
            get;
            set;
        } = new();

        public List<int> Capacities
        {
            get;
            set;
        } = new();
    }
}
