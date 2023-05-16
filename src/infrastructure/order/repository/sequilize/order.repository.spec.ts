import { Sequelize } from 'sequelize-typescript';
import Order from '../../../../domain/checkout/entity/order';
import OrderItem from '../../../../domain/checkout/entity/order_item';
import Customer from '../../../../domain/customer/entity/customer';
import Address from '../../../../domain/customer/value-object/address';
import Product from '../../../../domain/product/entity/product';
import CustomerModel from '../../../customer/repository/sequelize/customer.model';
import CustomerRepository from '../../../customer/repository/sequelize/customer.repository';
import ProductModel from '../../../product/repository/sequelize/product.model';
import ProductRepository from '../../../product/repository/sequelize/product.repository';
import OrderItemModel from './order-item.model';
import OrderModel from './order.model';
import OrderRepository from './order.repository';

describe('Order repository test', () => {
  let sequelize: Sequelize;
  let customerRepository: CustomerRepository;
  let productRepository: ProductRepository;
  let orderRepository: OrderRepository;

  beforeAll(() => {
    customerRepository = new CustomerRepository();
    productRepository = new ProductRepository();
    orderRepository = new OrderRepository();
  });

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should create a new order', async () => {
    const customer = new Customer('123', 'Customer 1');
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product('123', 'Product 1', 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order('123', '123', [orderItem]);
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: '123',
      customer_id: '123',
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: '123',
          product_id: '123',
        },
      ],
    });
  });

  it('should upate an order', async () => {
    const customer = new Customer('777', 'Customer Ninja');
    customer.changeAddress(
      new Address('Street Eleven', 1, '3210522', 'Manchester')
    );

    const product1 = new Product('22', 'Product 22', 10);
    const product2 = new Product('45', 'Product 45', 10);
    await Promise.all([
      customerRepository.create(customer),
      productRepository.create(product1),
      productRepository.create(product2),
    ]);

    const orderItem1 = new OrderItem(
      '1',
      product1.name,
      product1.price,
      product1.id,
      2
    );
    const orderItem2 = new OrderItem(
      '2',
      product2.name,
      product2.price,
      product2.id,
      2
    );
    const order = new Order('1', '777', [orderItem1, orderItem2]);
    await orderRepository.create(order);

    order.items[0].changeQuantity(30);

    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: '1',
      customer_id: '777',
      total: order.total(),
      items: [
        {
          id: orderItem1.id,
          name: orderItem1.name,
          price: orderItem1.price,
          quantity: 30,
          order_id: order.id,
          product_id: product1.id,
        },
        {
          id: orderItem2.id,
          name: orderItem2.name,
          price: orderItem2.price,
          quantity: 2,
          order_id: order.id,
          product_id: product2.id,
        },
      ],
    });
  });
  it('should find all orders', async () => {
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');

    const customer1 = new Customer('1', 'Customer 1');
    customer1.changeAddress(address);

    const customer2 = new Customer('2', 'Customer 2');
    customer2.changeAddress(address);

    const customer3 = new Customer('3', 'Customer 3');
    customer3.changeAddress(address);

    await Promise.all([
      customerRepository.create(customer1),
      customerRepository.create(customer2),
      customerRepository.create(customer3),
    ]);

    const product = new Product('1', 'Product 1', 10);
    await productRepository.create(product);

    const orderItem1 = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2
    );
    const orderItem2 = new OrderItem(
      '2',
      product.name,
      product.price,
      product.id,
      2
    );
    const orderItem3 = new OrderItem(
      '3',
      product.name,
      product.price,
      product.id,
      2
    );
    const order1 = new Order('1', '1', [orderItem1]);
    const order2 = new Order('2', '2', [orderItem2]);
    const order3 = new Order('3', '3', [orderItem3]);

    await Promise.all([
      orderRepository.create(order1),
      orderRepository.create(order2),
      orderRepository.create(order3),
    ]);

    const foundedOrders = await orderRepository.findAll();
    expect(foundedOrders.length).toBe(3);

    const foundedOrder1 = foundedOrders.find(
      (order) => order.customerId === '1'
    );
    expect(foundedOrder1).toStrictEqual(order1);

    const foundedOrder2 = foundedOrders.find(
      (order) => order.customerId === '2'
    );
    expect(foundedOrder2).toStrictEqual(order2);

    const foundedOrder3 = foundedOrders.find(
      (order) => order.customerId === '3'
    );
    expect(foundedOrder3).toStrictEqual(order3);
  });

  it('should find an order', async () => {
    const customer = new Customer('123', 'Customer 1');
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product('123', 'Product 1', 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order('123', '123', [orderItem]);
    await orderRepository.create(order);

    const orderFounded = await orderRepository.find(order.id);
    expect(orderFounded).toStrictEqual(order);
  });
});
