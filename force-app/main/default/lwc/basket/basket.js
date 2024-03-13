import { LightningElement, wire, track, api } from 'lwc';
import { subscribe, publish, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import msgService from '@salesforce/messageChannel/messageChannelBasket__c';
import msgTile from '@salesforce/messageChannel/messageChannelBasket__c';
import validateCoupon from '@salesforce/apex/CouponController.validateCoupon';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Basket extends LightningElement {

    basketProducts = [];
    subscription;
    @track
    messageReceived;
    @track tab = [];
    sousTotal;
    secondBasket = [];
    @track couponCode = '';
    couponValue;
    //products in the basket
    @api
    recordId;
    //quantity in the basket 
    basketQty;
    @wire(MessageContext)
    messageContext;

    handleCouponCodeChange(event) {
        this.couponCode = event.target.value;
    }

    showErrorToast(message) {
        const toastEvent = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(toastEvent);
    }

     // Utiliser la fonction de tri pour trier la liste par prix ascendant
     handleSortAsc() {
        this.basketProducts.sort((a, b) => a.price - b.price);
    }

    // Utiliser la fonction de tri pour trier la liste par prix descendant
    handleSortDesc() {
        this.basketProducts.sort((a, b) => b.price - a.price);
    }

    //traitement de code coupon  
    applyCoupon() {
        // Appeler la méthode Apex 
        validateCoupon({ couponCode: this.couponCode })
            .then(result => {
                if (result != null) {
                    const currentDate = new Date();
                    const startDate = new Date(result.StartDate__c);
                    const endDate = new Date(result.EndDate__c);

                    if (endDate < currentDate) {
                        this.showErrorToast('Le code coupon est expiré.');

                    } else {
                        this.couponValue = result.couponN__c;
                        console.log('Coupon Applied');
                        console.log(result.couponN__c);
                    }
                } else {
                    console.error('Invalid Coupon Code');
                    this.showErrorToast('Le code coupon est invalide.');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }


    //incrementation de la quantité a partir du panier
    incrementQuantity(event) {

        const value = event.target.dataset.value;
        this.tab = this.tab.map((element) => {
            try {
                if (element.product.Id == value) {
                    let _element = { ...element };
                    if (_element.product.Quantity__c > _element.addedQty) {
                        _element.addedQty++;
                        _element.sousTotal = _element.addedQty * _element.price;
                        return _element;
                    } else {
                        this.showErrorToast('La quantité sélectionnée dépasse la quantité disponible en stock ');
                    }
                }
            } catch (error) {
                console.log('OUTPUT : ', JSON.stringify(error));
            }
            return element;
        })

        this.basketProducts = this.tab;


        console.log('quantite dans tab', JSON.stringify(this.tab))
        console.log('quantite dans basketProducts', JSON.stringify(this.basketProducts))
    }
    // decrementation de la quantité a partir du panier
   decrementQuantity(event) {
    const value = event.target.dataset.value;
    this.tab = this.tab.map((element) => {
        try {
            if (element.product.Id == value) {
                let _element = { ...element };
                if (_element.addedQty > 1) {
                    _element.addedQty--;
                    _element.sousTotal = _element.addedQty * _element.price;
                    return _element;
                } else {
                    // Supprimer l'élément lorsque addedQty est égal à 0
                    return null;
                }
            }
        } catch (error) {
            console.log('OUTPUT : ', JSON.stringify(error));
        }
        return element;
    });

    // Filtrer les éléments non nuls
    this.tab = this.tab.filter((element) => element !== null);

    this.basketProducts = this.tab;
}


    //subscribe to the channel for the first time 
    connectedCallback() {

        this.subscription = subscribe(this.messageContext, msgTile, (message) => { this.handleMessage(message) }, { scope: APPLICATION_SCOPE })
    }

    handleMessage(message) {

        this.messageReceived = message.lmsData.data ? message.lmsData.data : null;

        //if list is empty and qty >0 add product directly
        if (this.tab.length == 0) {

            this.tab.push(this.messageReceived);
            this.tab = this.tab.map((element) => {
                try {
                    if (element.product.Id == this.messageReceived.product.Id) {
                        let _element = { ...element };
                        _element.sousTotal = _element.addedQty * _element.price;
                        return _element;
                    }
                }
                catch (error) {
                    console.log('OUTPUT : ', JSON.stringify(error));
                }
                return element;
            })

        } else {
            //if list not empty do a check to make sure the product does not already exist
            const productExists = this.tab.some((element) => element.product.Id == this.messageReceived.product.Id);

            //if product is not in the basket and its quantity > 0 add it 
            if (!productExists && this.messageReceived.product.Quantity__c > 0) {
                this.tab.push(this.messageReceived);
                this.tab = this.tab.map((element) => {
                    try {
                        if (element.product.Id == this.messageReceived.product.Id) {
                            let _element = { ...element };
                            _element.sousTotal = _element.addedQty * _element.price;
                            return _element;
                        }
                    } catch (error) {
                        console.log('OUTPUT : ', JSON.stringify(error));
                    }
                    return element;
                })
                //if product is already in the basket check the temp quantity if > 0
            } else {
                //console.log('product already in the basket',this.tab[0].addedQty)
                if (this.tempQty == 0) {

                    console.log('Nothing in stock', this.tempQty);
                } else {
                    console.log('prob herre')
                    let foundIndex = this.tab.findIndex(item => item.product.Id === this.messageReceived.product.Id);
                    this.tab[foundIndex] = this.messageReceived
                    this.tab = this.tab.map((element) => {
                        console.log('LAT', JSON.stringify(element.product.Id));
                        try {
                            if (element.product.Id == this.messageReceived.product.Id) {
                                let _element = { ...element };
                                _element.sousTotal = _element.addedQty * _element.price;
                                console.log('totaaaal', _element.sousTotal)
                                return _element;
                            }

                        } catch (error) {
                            console.log('OUTPUT : ', JSON.stringify(error));
                        }
                        return element;
                    })
                    console.log('pppp existing pro', this.tab[foundIndex])
                }


            }

        }
        
        console.log('quantite', JSON.stringify(this.tab))
        this.basketProducts = this.tab;
    }

    //subscribe(messageContext,channel,listener,subscriberOption)
    subscribeHandler() {
        this.subscription = subscribe(this.messageContext, msgService, (message) => { this.handleMessage(message) }, { scope: APPLICATION_SCOPE })
    }
}