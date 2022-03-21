const router = require('express').Router();
const {
    getAllPizza,
    getPizzaById,
    createPizza,
    updatePizza,
    deletePizza
} = require('../../controller/pizza-controller')
//set up get all and post at /api/Pizzas

router
.route('/')
.get(getAllPizza)
.post(createPizza);

//set up get one, put, and delete at /api/Pizzas/:id

router
.route('/:id')
.get(getPizzaById)
.put(updatePizza)
.delete(deletePizza);

module.exports = router;