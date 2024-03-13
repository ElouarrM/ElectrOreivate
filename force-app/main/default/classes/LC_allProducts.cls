public with sharing class LC_allProducts {
    
    @AuraEnabled(cacheable=true)
    public static List<Product2> getAllProducts(){
        try {
            return [SELECT Id, Name, Category__c, Quantity__c,ClientQty__c, DisplayUrl FROM Product2];
        } catch(Exception e){
            System.debug('Exception !!!!' + e.getMessage());
            return new List<Product2>();
        }
    }

    public class ProductWrapper {
        @AuraEnabled
        public Product2 product { get; set; }
        @AuraEnabled
        public Decimal price { get; set; }
        @AuraEnabled
        public Boolean isAvailable { get; set; }
         @AuraEnabled
        public Decimal addedQty { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static List<ProductWrapper> getWrappedProducts(String categoryFilter, String priceFilter, Boolean availabilityFilter) {
        List<Product2> productList = getAllProducts();

        Map<Id, Decimal> productIdPrice = new Map<Id, Decimal>();
        Map<Id, Decimal> productIdQuantity = new Map<Id, Decimal>();
        List<PricebookEntry> priceEntries = [SELECT Product2Id, UnitPrice FROM PricebookEntry WHERE Product2Id IN :productList];
        List<Product2> quantityEntries = [SELECT Id, Quantity__c FROM Product2 WHERE Id IN :productList];

        for (PricebookEntry entry : priceEntries) {
            productIdPrice.put(entry.Product2Id, entry.UnitPrice);
        }

        for (Product2 product : quantityEntries) {
            productIdQuantity.put(product.Id, product.Quantity__c);
        }

        List<ProductWrapper> productsWrapped = new List<ProductWrapper>();
        for (Product2 product : productList) {
            Decimal productPrice = productIdPrice.get(product.Id);
            Decimal productQuantity = productIdQuantity.get(product.Id);

            //l'application de filtrage selon la categorie,prix et la disponibilté
            if (isCategoryMatch(product, categoryFilter) && isPriceInRange(productPrice, Decimal.valueOf(priceFilter)) && isAvailabilityMatch(productQuantity, availabilityFilter)) {
                ProductWrapper productWrapped = new ProductWrapper();
                productWrapped.product = product;
                productWrapped.price = productPrice;
                productWrapped.isAvailable = productQuantity > 0;
                productsWrapped.add(productWrapped);
            }
        }

        return productsWrapped;
    }
    //la condition sur les types de produit
    private static Boolean isCategoryMatch(Product2 product, String categoryFilter) {
        return String.isBlank(categoryFilter) || product.Category__c == categoryFilter;
    }


// la condition sur le prix de chaque produit
private static Boolean isPriceInRange(Decimal price, Decimal priceFilter) {
    if (priceFilter != null) {
        return price <= priceFilter;
    }
    return true;
}

    // la condition sur la disponibilte de produit
    private static Boolean isAvailabilityMatch(Decimal quantity, Boolean availabilityFilter) {
        if (availabilityFilter != null) {
            return availabilityFilter ? quantity > 0 : quantity <= 0;
        }
        return true;
    }

    // return tous les produit sans filtrage
     @AuraEnabled(cacheable=true)
    public static List<ProductWrapper> getWrappedAllProducts() {
        List<Product2> productList = getAllProducts();

        Map<Id, Decimal> productIdPrice = new Map<Id, Decimal>();
        Map<Id, Decimal> productIdQuantity = new Map<Id, Decimal>();
        List<PricebookEntry> priceEntries = [SELECT Product2Id, UnitPrice FROM PricebookEntry WHERE Product2Id IN :productList];
        List<Product2> quantityEntries = [SELECT Id, Quantity__c FROM Product2 WHERE Id IN :productList];

        for (PricebookEntry entry : priceEntries) {
            productIdPrice.put(entry.Product2Id, entry.UnitPrice);
        }

        for (Product2 product : quantityEntries) {
            productIdQuantity.put(product.Id, product.Quantity__c);
        }

        List<ProductWrapper> productsWrapped = new List<ProductWrapper>();
        for (Product2 product : productList) {
            Decimal productPrice = productIdPrice.get(product.Id);
            Decimal productQuantity = productIdQuantity.get(product.Id);
                ProductWrapper productWrapped = new ProductWrapper();
                productWrapped.product = product;
                productWrapped.price = productPrice;
                productWrapped.isAvailable = productQuantity > 0;
                productsWrapped.add(productWrapped);
            
        }

        return productsWrapped;
    }
}