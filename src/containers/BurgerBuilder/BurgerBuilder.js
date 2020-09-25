import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withError from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 1.7
}

class BurgerBuilder extends Component {
    
    state = {
        ingredients:null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount(){
        axios.get('https://react-my-burger-db568.firebaseio.com/ingredients.json').then(
            response => {
                this.setState({ingredients: response.data});
            }
        ).catch(error=> {
            this.setState({error: true});
        });
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    updatePurchaseState(ingredients){
        const sum = Object.keys(ingredients).map(igKey =>{
            return ingredients[igKey];
        }).reduce((sum,el) => {
            return sum+el;
        },0);
        this.setState({purchasable: sum>0});
    }

    purchaseCancelHandler = () =>{
        this.setState({purchasing: false});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount+1;
        const updatedIngredient = {...this.state.ingredients};
        updatedIngredient[type]= updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice+priceAddition;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredient});
        this.updatePurchaseState(updatedIngredient);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0) return;
        const newCount = oldCount -1;
        const updatedIngredients = {...this.state.ingredients};
        updatedIngredients[type] = newCount;
        const priceSub = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceSub;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients});
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseContinueHandler = () => {
       // alert('Continue!');
       this.setState({loading: true});
       const order = {
           ingredients: this.state.ingredients,
           price: this.state.totalPrice,
           customer: {
               name: 'Angel',
               address: 'Address 1',
               zipCode: 'zip'
           },
           email: 'test@test.com',
           deliveryMethod: 'fasst'
       }
       axios.post('/orders.json', order).then(response => {
           //console.log(response);
           this.setState({loading:false, purchasing:false});
       }).catch(error=> {
           //console.log(error);
           this.setState({loading:false,purchasing:false});
       });
    }
    
    render(){

        const disabledInfo = {
            ...this.state.ingredients
        };
        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary =  null;

        let burger = this.state.error? <p>Ingredients Cannot Be Loaded.</p> : <Spinner/>;
        if (this.state.ingredients){
            

            burger=(
                <Aux>
                    <Burger ingredients = {this.state.ingredients}/>
                    <BuildControls 
                        ingredientAdded={this.addIngredientHandler} 
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled = {disabledInfo}   
                        price = {this.state.totalPrice}
                        purchasable={this.state.purchasable}
                        ordered={this.purchaseHandler}
                    />
                </Aux>);

            orderSummary = <OrderSummary 
                ingredients={this.state.ingredients}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                price={this.state.totalPrice}
                />;
        }

        if(this.state.loading) orderSummary = <Spinner/>;
       

        return(
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                   {orderSummary}
                </Modal>
                {burger}

            </Aux>
        );
    }
}

export default withError(BurgerBuilder, axios);