%dw 2.0
output application/java

// Main product transformation
fun transformProduct(productData) = {
	"name": productData.product_name,
	"price": productData.pricing.price replace "$" with "" replace "," with "" as Number,
	"category": productData.collection default "General",
	"stock": 0, // Default stock
	"sku": productData.sku,
	"brand": productData.brand,
	"collection": productData.collection,
	"description": productData.description default "",
	"dimensions": productData.dimensions.dimensions default "",
	"weight": null, // Not provided in input
	"main_image_url": productData.dimensions.images.main_image_url default "",
	"is_active": true,
	"featured": false,
	"sort_order": 0
}

// Transform product images
fun transformImages(productData, productId) = {
	// Main image
	"main_image": {
		"product_id": productId,
		"image_url": productData.dimensions.images.main_image_url,
		"alt_text": productData.dimensions.images.alt_text default "",
		"is_primary": true,
		"sort_order": 0
	},
	// Additional images
	"additional_images": productData.dimensions.images.additional_images default [] map (image, index) -> {
		"product_id": productId,
		"image_url": image.url,
		"alt_text": image.alt_text default "",
		"is_primary": false,
		"sort_order": index + 1
	}
}

// Transform product features
fun transformFeatures(productData, productId) = {
	// Dimension features
	"dimension_features": productData.dimensions.features default [] map (feature) -> {
		"product_id": productId,
		"feature_name": feature[0],
		"feature_value": feature[1]
	},
	// Material features
	"material_features": productData.dimensions.materials default [] map (material) -> {
		"product_id": productId,
		"feature_name": "Material: " ++ material[0],
		"feature_value": material[1]
	},
	// Finish features
	"finish_features": productData.dimensions.finish default [] map (finish) -> {
		"product_id": productId,
		"feature_name": "Finish: " ++ finish[0],
		"feature_value": finish[1]
	},
	// Special features
	"special_features": productData.dimensions.special_features default [] map (feature, index) -> {
		"product_id": productId,
		"feature_name": "Special Feature " ++ (index + 1),
		"feature_value": feature
	}
}

// Main transformation function
fun transformProductData(productData) = {
	"product": transformProduct(productData),
	"images": transformImages(productData, null), // Will be set after product insert
	"features": transformFeatures(productData, null) // Will be set after product insert
}

// Usage example:
// transformProductData(payload)
