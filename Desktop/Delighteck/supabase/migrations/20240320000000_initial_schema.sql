-- Create restaurants table
CREATE TABLE restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    owner_id UUID NOT NULL
);

-- Create menu_items table
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'delivered')),
    total DECIMAL(10,2) NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID,
    table_number INTEGER NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    notes TEXT,
    price DECIMAL(10,2) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Restaurants: Only owner can modify their restaurant
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants
    FOR SELECT USING (true);

CREATE POLICY "Restaurants are editable by owner" ON restaurants
    FOR ALL USING (auth.uid() = owner_id);

-- Menu items: Only restaurant owner can modify their menu
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
    FOR SELECT USING (true);

CREATE POLICY "Menu items are editable by restaurant owner" ON menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = menu_items.restaurant_id
            AND restaurants.owner_id = auth.uid()
        )
    );

CREATE POLICY "Menu items are insertable by restaurant owner" ON menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = menu_items.restaurant_id
            AND restaurants.owner_id = auth.uid()
        )
    );

CREATE POLICY "Menu items are deletable by restaurant owner" ON menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = menu_items.restaurant_id
            AND restaurants.owner_id = auth.uid()
        )
    );

-- Orders: Customers can create orders, restaurant owners can view and update
CREATE POLICY "Orders are viewable by restaurant owner" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = orders.restaurant_id
            AND restaurants.owner_id = auth.uid()
        )
    );

CREATE POLICY "Orders are creatable by anyone" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are updatable by restaurant owner" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = orders.restaurant_id
            AND restaurants.owner_id = auth.uid()
        )
    );

-- Order items: Follow the same rules as orders
CREATE POLICY "Order items are viewable by restaurant owner" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            JOIN restaurants ON restaurants.id = orders.restaurant_id
            WHERE orders.id = order_items.order_id
            AND restaurants.owner_id = auth.uid()
        )
    );

CREATE POLICY "Order items are creatable by anyone" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items are updatable by restaurant owner" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders
            JOIN restaurants ON restaurants.id = orders.restaurant_id
            WHERE orders.id = order_items.order_id
            AND restaurants.owner_id = auth.uid()
        )
    ); 