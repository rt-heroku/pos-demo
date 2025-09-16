# MuleSoft Product Import Integration

## Overview
This MuleSoft integration provides a complete solution for importing product data from external systems into the POS database. The integration handles complex product JSON structures and maps them to the existing database schema.

## Files Structure
```
mulesoft/
├── README.md                    # This documentation file
├── mule-config.xml             # Basic MuleSoft configuration
├── product-import-flow.xml     # Complete product import flow with validation
├── product-transform.dwl       # DataWeave transformation functions
├── database-changes.md         # Database schema analysis and requirements
└── optional-enhancements.sql   # Optional database enhancements
```

## Product JSON Structure
The integration handles the following JSON structure:

```json
{
    "product_name": "Short Trip Expandable 4 Wheeled Packing Case",
    "sku": "01171652693",
    "brand": "Tumi",
    "collection": "TUMI ALPHA",
    "description": "Experience the luxury of flexible packing...",
    "short_description": "",
    "pricing": {
        "price": "$1,035",
        "member_price": "",
        "suggested_monthly_payment": "",
        "financing_terms": ""
    },
    "dimensions": {
        "dimensions": "26.0 x 19.0 x 13.0\" (15.0\" Expanded Depth)",
        "details": [
            ["height","26.0 inches"],
            ["width","19.0 inches"],
            ["depth","13.0 inches"]
        ],
        "features": [["Expansion","15.0\" Expanded Depth"]],
        "materials": [["Primary Material","Ballistic Nylon"]],
        "finish": [["finish_color","Black"]],
        "style": "",
        "availability": "In Stock",
        "images": {
            "main_image_url": "https://tumi.scene7.com/is/image/Tumi/1171652693_main?wid=1020&hei=1238",
            "alt_text": "Short Trip Expandable 4 Wheeled Packing Case product image two",
            "additional_images": [
                {
                    "url": "https://tumi.scene7.com/is/image/Tumi/1171652693_alt7?wid=1020&hei=1238",
                    "alt_text": "Short Trip Expandable 4 Wheeled Packing Case product image two"
                }
            ]
        },
        "delivery_options": [],
        "special_features": [],
        "care_instructions": "",
        "warranty": "",
        "retailer": {
            "name": "Tumi",
            "url": "https://www.tumi.com/p/short-trip-expandable-4-wheeled-packing-case-01171652693.html"
        }
    }
}
```

## API Endpoint

### POST /products/import
Imports a product from the provided JSON structure.

**Request:**
- Method: POST
- Content-Type: application/json
- Body: Product JSON structure (see above)

**Response:**
```json
{
    "success": true,
    "message": "Product imported successfully",
    "product_id": 123,
    "product_name": "Short Trip Expandable 4 Wheeled Packing Case",
    "sku": "01171652693",
    "brand": "Tumi"
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "Validation failed",
    "validation_errors": ["product_name is required", "sku is required"]
}
```

## Database Mapping

### Products Table
| JSON Field | Database Field | Transformation |
|------------|----------------|----------------|
| `product_name` | `name` | Direct mapping |
| `sku` | `sku` | Direct mapping |
| `brand` | `brand` | Direct mapping |
| `collection` | `collection` | Direct mapping |
| `description` | `description` | Direct mapping |
| `pricing.price` | `price` | Remove $ and commas, convert to decimal |
| `dimensions.dimensions` | `dimensions` | Direct mapping |
| `dimensions.images.main_image_url` | `main_image_url` | Direct mapping |

### Product Images Table
| JSON Field | Database Field | Transformation |
|------------|----------------|----------------|
| `dimensions.images.main_image_url` | `image_url` | Main image (is_primary = true) |
| `dimensions.images.alt_text` | `alt_text` | Main image alt text |
| `dimensions.images.additional_images[].url` | `image_url` | Additional images (is_primary = false) |
| `dimensions.images.additional_images[].alt_text` | `alt_text` | Additional images alt text |

### Product Features Table
| JSON Field | Database Field | Transformation |
|------------|----------------|----------------|
| `dimensions.features[][]` | `feature_name`, `feature_value` | Array pairs to feature records |
| `dimensions.materials[][]` | `feature_name`, `feature_value` | Prefixed with "Material: " |
| `dimensions.finish[][]` | `feature_name`, `feature_value` | Prefixed with "Finish: " |
| `dimensions.special_features[]` | `feature_name`, `feature_value` | Prefixed with "Special Feature " |

## Validation Rules

### Required Fields
- `product_name` - Product name is required
- `sku` - SKU is required and must be unique
- `brand` - Brand is required
- `pricing.price` - Price is required

### Business Rules
- SKU must be unique across all products
- Price must be a valid number (dollar signs and commas are stripped)
- Product is set to active by default
- Default stock is set to 0

## Error Handling

### Validation Errors (400 Bad Request)
- Missing required fields
- Invalid data formats
- Business rule violations

### Conflict Errors (409 Conflict)
- SKU already exists

### Server Errors (500 Internal Server Error)
- Database connection issues
- Unexpected system errors

## Configuration

### Environment Variables
```properties
# Database Configuration
db.host=localhost
db.port=5432
db.user=your_username
db.password=your_password
db.database=pos_demo
```

### MuleSoft Configuration
The integration uses:
- HTTP Listener on port 8081
- PostgreSQL Database Connector
- DataWeave 2.0 for transformations
- Comprehensive error handling

## Testing

### Test the Integration
```bash
# Test with valid product data
curl -X POST http://localhost:8081/products/import \
  -H "Content-Type: application/json" \
  -d @sample-product.json

# Test with invalid data
curl -X POST http://localhost:8081/products/import \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Test Product"}'
```

### Sample Test Data
Create a file `sample-product.json` with the product JSON structure provided above.

## Database Schema Compatibility

### ✅ No Database Changes Required
The current database schema is fully compatible with the MuleSoft integration:

- **Products Table**: All required fields are present
- **Product Images Table**: Handles multiple images per product
- **Product Features Table**: Handles multiple features per product
- **Data Types**: All data types are appropriate for the input structure

### Optional Enhancements
The `optional-enhancements.sql` file contains additional tables and features that can be implemented for enhanced functionality:

- Product categories table
- Product tags system
- Product variants
- Product reviews
- Inventory history tracking
- Pricing history tracking

## Deployment

### Prerequisites
- MuleSoft Runtime 4.4+
- PostgreSQL Database
- Java 8+

### Deployment Steps
1. Configure database connection properties
2. Deploy the MuleSoft application
3. Test the integration endpoint
4. Monitor logs for any issues

### Monitoring
- Check MuleSoft application logs
- Monitor database for successful inserts
- Verify data integrity after imports

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify database credentials
   - Check network connectivity
   - Ensure database is running

2. **SKU Already Exists**
   - Check if product already exists
   - Use different SKU or update existing product

3. **Validation Errors**
   - Ensure all required fields are present
   - Check data format (especially price field)

4. **Image URL Issues**
   - Verify image URLs are accessible
   - Check for proper URL encoding

### Logs
Monitor the following for troubleshooting:
- MuleSoft application logs
- Database query logs
- HTTP request/response logs

## Support

For issues or questions:
1. Check the logs for error details
2. Verify database schema compatibility
3. Test with sample data
4. Review the DataWeave transformations

## Future Enhancements

Potential future improvements:
- Bulk product import
- Product update functionality
- Image optimization and resizing
- Advanced validation rules
- Integration with external image services
- Product synchronization with external systems
