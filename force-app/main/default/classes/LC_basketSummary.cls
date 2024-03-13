public with sharing class LC_basketSummary {
        
        //get the list of products not wrapper
        public static List<Product2> getProductBasket(List<LC_allProducts.ProductWrapper> products){
            // Extract the IDs from the list of ProductWrapper 
            Set<Id> productIds = new Set<Id>();
            for (LC_allProducts.ProductWrapper wrapper : products) {
                    productIds.add(wrapper.product.Id);
            }
            //return only the products existing in the basket 
            List<Product2> listProductBasket = [SELECT Id, Name, Category__c, Quantity__c,ClientQty__c, DisplayUrl 
                                                    FROM Product2 
                                                    WHERE Id in :productIds];
            
            return listProductBasket;
        }
        
        @AuraEnabled(cacheable=false)
        public static void changeQuantity(List<LC_allProducts.ProductWrapper> products){
            System.debug(products);
            List<LC_allProducts.ProductWrapper> listProductToUpdate = new List<LC_allProducts.ProductWrapper>();
           	List<Product2> listProductBasket =  getProductBasket(products);
            List<Product2> productBasket =  new List<Product2>();


            for(LC_allProducts.ProductWrapper product : products){
                for(Product2 pro : listProductBasket){
                    if(product.product.id == pro.Id){
                        pro.Quantity__c = pro.Quantity__c - product.addedQty;
                        productBasket.add(pro);

                    }
                }
                //product.product.Quantity__c = product.product.Quantity__c  - product.addedQty ;
            }

            Integer dmlStatements = Limits.getDmlStatements();

            System.debug('DML statements executed so far: ' + dmlStatements);
            System.debug(productBasket);
            if(productBasket.size() > 0 ){
                update productBasket ;
            }

        }
}