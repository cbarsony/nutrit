var foodCategories = require('../../food_categories.js');
var Utils = require('./food_selector_utils.js');

var FoodSelector = React.createClass({
	getInitialState: function() {
		return {
			selectedFoodCategory: foodCategories,
			foods: [],
			loading: false
		};
	},
	render: function() {
		var list;
		
		if(this.state.selectedFoodCategory.sub) {
			list = _.map(this.state.selectedFoodCategory.sub, function(category) {
				return (<FoodCategory category={category} key={category.id} selectCategory={this.selectCategory} />);
			}, this);
		}
		else {
			list = _.map(this.state.foods, function(ingredient) {
				return (
					<div key={ingredient.id}>
						<Ingredient ingredient={ingredient} add={this.addIngredient} />
					</div>);
			}, this);
		}
			
		var controls = this.state.selectedFoodCategory.root ? null : (
			<div className="food-selector-controls">
				<button className="food-category" onClick={this.backButtonClick}>
					<div>
						<i className="flaticon-previous"></i>
					</div>
					<div>
						<span>Back</span>
					</div>
				</button>
			
				<button className="food-category" onClick={this.rootButtonClick}>
					<div>
						<i className="flaticon-refresh"></i>
					</div>
					<div>
						<span>All categories</span>
					</div>
				</button>
			</div>
		);
			
		var content = (
			<div>
				<div className="food-selector-list">
					{list}
				</div>
				{controls}
			</div>
		);
		
		return (
			<div className="food-selector">
				{this.state.loading ? (<div>loading...</div>) : content}
			</div>
		);
	},
	addIngredient: function(id) {
		var amount = prompt('Please enter the amount of food in grams!', '100');
		
		if(amount) {
			var ingredientData = bella.data.ingredients.get();
			ingredientData.push({ food: _.find(this.state.foods, { id: id }), amount: { quantity: parseInt(amount), unit: 'g' } });
			bella.data.ingredients.set(ingredientData);
		}
	},
	selectCategory: function(category) {
		var selectedCategory = _.find(this.state.selectedFoodCategory.sub, { id: category });
		
		if(selectedCategory.sub) {
			this.setState({
				selectedFoodCategory: selectedCategory,
				foods: []
			});
		}
		else {
			cs.get('/foods/' + selectedCategory.id, (status, foods) => {
				if(status === 200) {
					this.setState({
						selectedFoodCategory: selectedCategory,
						foods: foods,
						loading: false
					});
				}
			});
			this.setState({ loading: true });
		}
	},
	backButtonClick: function() {
		var parentCategory = Utils.findParentCategory(foodCategories, this.state.selectedFoodCategory.id);
		
		this.setState({
			selectedFoodCategory: parentCategory,
			foods: []
		});
	},
	rootButtonClick: function() {
		this.setState({
			selectedFoodCategory: foodCategories,
			foods: []
		});
	}
});

var FoodCategory = React.createClass({
	render: function() {
		var iconClass = 'flaticon-' + this.props.category.id;
	
		return (
			<button className="food-category" onClick={this.click}>
				<div>
					<i className={iconClass.toLowerCase()}></i>
				</div>
				<div>
					<span>{this.props.category.name}</span>
				</div>
			</button>
		);
	},
	click: function() {
		this.props.selectCategory(this.props.category.id);	
	}
});

var Ingredient = React.createClass({
	render: function() {
		return (
			<div className="ingredient">
				<span>{this.props.ingredient.name}, {this.props.ingredient.description}</span>
				<button className="food-category add-ingredient" onClick={this.add}>
					<div>
						<i className="flaticon-add"></i>
					</div>
					<div>
						<span>Add</span>
					</div>
				</button>
			</div>
		);
	},
	add: function() {
		this.props.add(this.props.ingredient.id);
	}
});

ReactDOM.render(
	<FoodSelector />,
	document.getElementById('food-selector-cont')
);