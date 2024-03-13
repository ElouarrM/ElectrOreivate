import { LightningElement, wire,track } from 'lwc';
import getWrappedProducts from '@salesforce/apex/LC_allProducts.getWrappedProducts';
import getWrappedAllProducts from '@salesforce/apex/LC_allProducts.getWrappedAllProducts';

export default class AllProducts extends LightningElement {
    @track products=[];

    @wire(getWrappedAllProducts)
    wiredProducts({ data, error }) {
        if (data) {
            this.products = data;
            console.log(this.products);
        } else if (error) {
            console.error('Error retrieving products:', error);
        }
    }

    handleSearchClick(event) {
        const filteredProducts = event.detail.products;
        this.products = filteredProducts;
    }

     get isProductListEmpty() {
        return this.products.length === 0;
    }


}