public class CouponController {
    @AuraEnabled
    public static Coupon__c validateCoupon(String couponCode) {
        Coupon__c coupon = [SELECT Id, Name, couponN__c, User__c, StartDate__c, EndDate__c FROM Coupon__c WHERE Name = :couponCode and User__c =: UserInfo.getUserId()]?? new Coupon__c();
        
        if (!String.isBlank(coupon.Id)  ) {
            return coupon;
        }

        return null;
    }
}