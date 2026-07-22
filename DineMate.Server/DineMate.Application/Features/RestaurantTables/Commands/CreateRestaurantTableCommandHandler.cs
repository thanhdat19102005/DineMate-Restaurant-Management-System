using DineMate.Application.Dtos.RestaurantTables;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.RestaurantTables.Commands
{
    public class
        CreateRestaurantTableCommandHandler
        : IRequestHandler<
            CreateRestaurantTableCommand,
            CreateRestaurantTableResponseDto
        >
    {
        private readonly
            ICreateRestaurantTableRepository
            _createRepository;

        private readonly
            IRestaurantTableQrUrlService
            _qrUrlService;

        public
            CreateRestaurantTableCommandHandler(
                ICreateRestaurantTableRepository
                    createRepository,

                IRestaurantTableQrUrlService
                    qrUrlService
            )
        {
            _createRepository =
                createRepository;

            _qrUrlService =
                qrUrlService;
        }

        public async Task<
            CreateRestaurantTableResponseDto
        > Handle(
            CreateRestaurantTableCommand request,
            CancellationToken cancellationToken
        )
        {
            // ==================================================
            // 1. DOMAIN KIỂM TRA DỮ LIỆU
            // ==================================================

            var validationResult =
                CreateRestaurantTableValidationRules
                    .Validate(
                        request.Id,
                        request.TableName,
                        request.Capacity,
                        request.TableType,
                        request.AreaName,
                        request.Note
                    );

            if (!validationResult.IsSuccess)
            {
                return new
                    CreateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 2. CHUẨN HÓA DỮ LIỆU
            // ==================================================

            var normalizedId =
                request.Id
                    .Trim()
                    .ToUpperInvariant();

            var normalizedTableName =
                request.TableName.Trim();

            var normalizedTableType =
                CreateRestaurantTableValidationRules
                    .NormalizeTableType(
                        request.TableType
                    );

            var normalizedAreaName =
                string.IsNullOrWhiteSpace(
                    request.AreaName
                )
                    ? null
                    : request.AreaName.Trim();

            var normalizedNote =
                string.IsNullOrWhiteSpace(
                    request.Note
                )
                    ? null
                    : request.Note.Trim();

            // ==================================================
            // 3. KIỂM TRA MÃ BÀN TRÙNG
            // ==================================================

            var tableExists =
                await _createRepository
                    .ExistsByIdAsync(
                        normalizedId,
                        cancellationToken
                    );

            if (tableExists)
            {
                return new
                    CreateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        $"Mã bàn {normalizedId} đã tồn tại."
                };
            }

            // ==================================================
            // 4. TẠO ĐƯỜNG DẪN QR
            // ==================================================

            var qrContent =
                _qrUrlService
                    .GenerateOrderUrl(
                        normalizedId
                    );

            // Ví dụ:
            // http://localhost:4200/order/A010

            // ==================================================
            // 5. GỬI XUỐNG INFRASTRUCTURE
            // ==================================================

            return await _createRepository
                .CreateAsync(
                    normalizedId,
                    normalizedTableName,
                    request.Capacity,
                    normalizedTableType,
                    normalizedAreaName,
                    normalizedNote,
                    qrContent,
                    request.UserId,
                    request.UserName,
                    request.IpAddress,
                    cancellationToken
                );
        }
    }
}
