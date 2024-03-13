import { LightningElement, api } from 'lwc';
import changeQuantity from '@salesforce/apex/LC_basketSummary.changeQuantity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BasketSummary extends LightningElement {
    @api basketProducts = [];
    @api couponValue;

    // Calculez et retournez la somme des prix * quantité de chaque produit
    get totalAmount() {
        return this.basketProducts.reduce((total, product) => {
            return total +(product.price * product.addedQty);
        }, 0);
    }

    // Calculez et retournez le total avant réduction
    get totalAmountBeforeDiscount() {
        return this.totalAmount;
    }

    get discount(){
        return  (this.totalAmount*this.couponValue)/100 ;
    }
    // Calculez et retournez le total après réduction en fonction du couponValue
    get totalAmountAfterDiscount() {
        const discountPercentage = parseFloat(this.couponValue);
        const discountFactor = 1 - discountPercentage / 100;
        return (this.totalAmount * discountFactor).toFixed(2);
    }


    //decrement quantity of product in stock after validating 
    handleClick(){
        //update quantity of the product in the stock 
        changeQuantity({products : this.basketProducts})
              .then(()=>{
                const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Operation sucessful',
                    variant: 'success',
                });
                this.dispatchEvent(evt);

            })
            .catch(error => { // Define the error variable here
                console.error(error);
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Unexpected error has occurred',
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            })
        // Reload the current page
    setTimeout(() => {
                window.location.reload()
                }, "1500");
    }
}