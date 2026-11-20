import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';

const COFFEES = [
  {
    id: '1',
    name: 'Caffe Mocha',
    subtitle: 'Deep Foam',
    price: 4.53,
    rating: 4.8,
    reviews: 230,
    category: 'Macchiato',
    img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80',
    desc: 'Rich espresso combined with velvety steamed milk and chocolate notes for a balanced, comforting cup.',
  },
  {
    id: '2',
    name: 'Flat White',
    subtitle: 'Espresso',
    price: 3.53,
    rating: 4.9,
    reviews: 185,
    category: 'Latte',
    img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
    desc: 'Smooth microfoam poured over a double shot of espresso, keeping the coffee flavor strong and clean.',
  },
  {
    id: '3',
    name: 'Caramel Macchiato',
    subtitle: 'Sweet Vanilla',
    price: 4.8,
    rating: 4.7,
    reviews: 310,
    category: 'Macchiato',
    img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80',
    desc: 'Steamed milk with vanilla notes, layered espresso, and a sweet caramel finish.',
  },
  {
    id: '4',
    name: 'Iced Americano',
    subtitle: 'Double Shot',
    price: 3.2,
    rating: 4.6,
    reviews: 140,
    category: 'Americano',
    img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80',
    desc: 'Crisp double espresso over cold ice and water for a refreshing everyday drink.',
  },
  {
    id: '5',
    name: 'Spanish Latte',
    subtitle: 'Condensed Milk',
    price: 4.95,
    rating: 4.9,
    reviews: 412,
    category: 'Latte',
    img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80',
    desc: 'Bold espresso balanced with creamy milk and sweet condensed milk.',
  },
];

const SIZE_EXTRA = { S: 0, M: 0.5, L: 1.0 };

export default function App() {
  const [screen, setScreen] = useState('Onboarding');
  const [selectedCoffee, setSelectedCoffee] = useState(COFFEES[0]);
  const [activeCategory, setActiveCategory] = useState('All Coffee');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailSize, setDetailSize] = useState('M');
  const [deliveryType, setDeliveryType] = useState('Deliver');
  const [favorites, setFavorites] = useState(['1']);

  // Себет күйі: [{ key, coffee, size, qty }]
  const [cart, setCart] = useState([]);

  // Настройка / Фильтр модалінің күйі
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [maxPrice, setMaxPrice] = useState('all'); // 'all' | '4' | '4.8'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'priceAsc' | 'ratingDesc'

  // Соңғы рәсімделген заказ
  const [activeOrder, setActiveOrder] = useState(null);

  const categories = ['All Coffee', 'Macchiato', 'Latte', 'Americano'];

  const addToCart = (coffee, size = 'M', openOrderAfter = false) => {
    const key = `${coffee.id}-${size}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { key, coffee, size, qty: 1 }];
    });

    if (openOrderAfter) {
      setScreen('Order');
    } else {
      Alert.alert('Себетке қосылды', `${coffee.name} (${size}) себетке салынды.`);
    }
  };

  const updateCartQty = (key, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const filteredCoffees = useMemo(() => {
    let list = COFFEES.filter((item) => {
      const matchCat =
        activeCategory === 'All Coffee' || item.category === activeCategory;
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const matchPrice =
        maxPrice === 'all' ? true : item.price <= parseFloat(maxPrice);
      return matchCat && matchSearch && matchPrice;
    });

    if (sortBy === 'priceAsc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'ratingDesc') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [activeCategory, searchQuery, maxPrice, sortBy]);

  const getUnitPrice = (coffee, size) => coffee.price + (SIZE_EXTRA[size] || 0);

  const handlePlaceOrder = (orderItems) => {
    if (!orderItems.length) {
      Alert.alert('Себет бос', 'Алдымен кемінде бір кофе таңдаңыз.');
      return;
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + getUnitPrice(item.coffee, item.size) * item.qty,
      0
    );
    const deliveryFee = deliveryType === 'Deliver' ? 1.0 : 0.0;
    const total = (subtotal + deliveryFee).toFixed(2);

    setActiveOrder({
      items: orderItems,
      deliveryType,
      total,
      address: 'Алматы, Шевченко 97',
      timeLeft: deliveryType === 'Deliver' ? '10 minutes left' : 'Ready in 5 min',
    });

    setCart([]);
    setScreen('Delivery');
  };

  // 1. ONBOARDING
  if (screen === 'Onboarding') {
    return (
      <View style={styles.onboardingContainer}>
        <StatusBar barStyle="light-content" />
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
          }}
          style={styles.onboardingBg}
        />
        <View style={styles.onboardingOverlay}>
          <Text style={styles.onboardingTitle}>
            Fall in Love with Coffee in Blissful Delight!
          </Text>
          <Text style={styles.onboardingSub}>
            Welcome to our cozy coffee corner, where every cup is a delightful
            for you.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setScreen('Home')}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. HOME
  if (screen === 'Home') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.darkHeader}>
            <Text style={styles.locLabel}>Location</Text>
            <Text style={styles.locText}>Алматы, Шевченко 97 ▾</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search coffee"
                placeholderTextColor="#828282"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setFilterModalVisible(true)}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>⚙️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.promoCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
                }}
                style={styles.promoImg}
              />
              <View style={styles.promoOverlay}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>Promo</Text>
                </View>
                <Text style={styles.promoTitle}>
                  Buy one get{'\n'}one FREE
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.homeBody}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catBtn,
                    activeCategory === cat && styles.catBtnActive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catText,
                      activeCategory === cat && styles.catTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Popular Coffees ({filteredCoffees.length})
              </Text>
              {(maxPrice !== 'all' || sortBy !== 'default') && (
                <TouchableOpacity
                  onPress={() => {
                    setMaxPrice('all');
                    setSortBy('default');
                  }}
                >
                  <Text style={styles.resetFilterText}>Фильтрді тазалау</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingBottom: 24 }}
            >
              {filteredCoffees.map((item) => (
                <View key={item.id} style={styles.coffeeCardHorizontal}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedCoffee(item);
                      setDetailSize('M');
                      setScreen('Detail');
                    }}
                  >
                    <View>
                      <Image source={{ uri: item.img }} style={styles.cardImg} />
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSub}>{item.subtitle}</Text>
                  </TouchableOpacity>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardPrice}>
                      $ {item.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.plusBtn}
                      onPress={() => addToCart(item, 'M', false)}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 18,
                        }}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Настройка / Фильтр модалі */}
        <Modal
          visible={filterModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Баптау және Сұрыптау</Text>

              <Text style={styles.modalLabel}>Баға шегі</Text>
              <View style={styles.modalOptionRow}>
                {[
                  { id: 'all', label: 'Барлығы' },
                  { id: '4', label: '$4.00-ге дейін' },
                  { id: '4.8', label: '$4.80-ге дейін' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.modalChip,
                      maxPrice === opt.id && styles.modalChipActive,
                    ]}
                    onPress={() => setMaxPrice(opt.id)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        maxPrice === opt.id && styles.modalChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Сұрыптау</Text>
              <View style={styles.modalOptionRow}>
                {[
                  { id: 'default', label: 'Әдепкі' },
                  { id: 'priceAsc', label: 'Арзан → Қымбат' },
                  { id: 'ratingDesc', label: 'Рейтинг ★' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.modalChip,
                      sortBy === opt.id && styles.modalChipActive,
                    ]}
                    onPress={() => setSortBy(opt.id)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        sortBy === opt.id && styles.modalChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 20 }]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.primaryBtnText}>Қолдану</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Төменгі навигация */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => setScreen('Home')}>
            <Text style={{ color: '#C67C4E', fontSize: 22 }}>🏠</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Таңдаулылар',
                favorites.length
                  ? COFFEES.filter((c) => favorites.includes(c.id))
                      .map((c) => c.name)
                      .join(', ')
                  : 'Әзірге таңдаулы кофе жоқ'
              )
            }
          >
            <Text style={{ fontSize: 22 }}>🤍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartNavBtn}
            onPress={() => setScreen('Order')}
          >
            <Text style={{ fontSize: 22 }}>🛍️</Text>
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Хабарландыру',
                'Шевченко 97 филиалында Buy one get one FREE акциясы белсенді!'
              )
            }
          >
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 3. DETAIL
  if (screen === 'Detail') {
    const isFav = favorites.includes(selectedCoffee.id);
    const currentUnitPrice = getUnitPrice(selectedCoffee, detailSize);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setScreen('Home')}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Detail</Text>
          <TouchableOpacity onPress={() => toggleFavorite(selectedCoffee.id)}>
            <Text style={{ fontSize: 22 }}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ paddingHorizontal: 24 }}>
          <Image source={{ uri: selectedCoffee.img }} style={styles.detailImg} />
          <View style={styles.detailHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailTitle}>{selectedCoffee.name}</Text>
              <Text style={styles.detailSub}>
                Ice/Hot • {selectedCoffee.subtitle}
              </Text>
              <Text style={styles.detailRating}>
                ⭐ {selectedCoffee.rating}{' '}
                <Text style={{ color: '#828282', fontSize: 12 }}>
                  ({selectedCoffee.reviews})
                </Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.iconBox}>
                <Text>🛵</Text>
              </View>
              <View style={styles.iconBox}>
                <Text>☕</Text>
              </View>
              <View style={styles.iconBox}>
                <Text>🥛</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{selectedCoffee.desc}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Size</Text>
          <View style={styles.sizeRow}>
            {['S', 'M', 'L'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.sizeBox, detailSize === s && styles.sizeBoxActive]}
                onPress={() => setDetailSize(s)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    detailSize === s && styles.sizeTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomActionBar}>
          <View>
            <Text style={{ color: '#828282', fontSize: 12 }}>Price</Text>
            <Text style={styles.finalPrice}>$ {currentUnitPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, { width: '65%' }]}
            onPress={() => addToCart(selectedCoffee, detailSize, true)}
          >
            <Text style={styles.primaryBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 4. ORDER
  if (screen === 'Order') {
    const orderItems =
      cart.length > 0
        ? cart
        : [
            {
              key: `${selectedCoffee.id}-${detailSize}`,
              coffee: selectedCoffee,
              size: detailSize,
              qty: 1,
            },
          ];

    const subtotal = orderItems.reduce(
      (sum, item) => sum + getUnitPrice(item.coffee, item.size) * item.qty,
      0
    );
    const deliveryFee = deliveryType === 'Deliver' ? 1.0 : 0.0;
    const total = (subtotal + deliveryFee).toFixed(2);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setScreen('Home')}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Order</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView style={{ paddingHorizontal: 24 }}>
          <View style={styles.toggleRow}>
            {['Deliver', 'Pick Up'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleBtn,
                  deliveryType === type && styles.toggleBtnActive,
                ]}
                onPress={() => setDeliveryType(type)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    deliveryType === type && styles.toggleTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addrMain}>Шевченко 97</Text>
          <Text style={styles.addrSub}>Алматы қаласы</Text>

          <View style={styles.divider} />

          {orderItems.map((item) => {
            const unitPrice = getUnitPrice(item.coffee, item.size);
            return (
              <View key={item.key} style={styles.orderItemRow}>
                <Image
                  source={{ uri: item.coffee.img }}
                  style={styles.orderThumb}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{item.coffee.name}</Text>
                  <Text style={styles.cardSub}>
                    {item.coffee.subtitle} ({item.size}) • $
                    {unitPrice.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      if (cart.length > 0) {
                        updateCartQty(item.key, -1);
                      } else {
                        setScreen('Home');
                      }
                    }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 10, fontWeight: 'bold' }}>
                    {item.qty}
                  </Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      if (cart.length > 0) {
                        updateCartQty(item.key, 1);
                      } else {
                        addToCart(item.coffee, item.size, false);
                      }
                    }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={styles.discountBox}>
            <Text style={{ fontWeight: '600' }}>🏷️ 1 Discount is Applies</Text>
            <Text style={{ fontWeight: 'bold' }}>&gt;</Text>
          </View>

          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryVal}>$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryVal}>
              {deliveryType === 'Deliver' ? '$ 1.00' : '$ 0.00'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomActionBar}>
          <View>
            <Text style={{ fontWeight: 'bold' }}>💳 Cash/Wallet</Text>
            <Text
              style={{ color: '#C67C4E', fontWeight: 'bold', fontSize: 16 }}
            >
              $ {total}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, { width: '60%' }]}
            onPress={() => handlePlaceOrder(orderItems)}
          >
            <Text style={styles.primaryBtnText}>Order</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 5. DELIVERY
  const currentDelivery = activeOrder || {
    items: [],
    deliveryType: 'Deliver',
    total: '5.53',
    address: 'Алматы, Шевченко 97',
    timeLeft: '10 minutes left',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapMock}>
        <TouchableOpacity
          style={styles.mapBackBtn}
          onPress={() => setScreen('Home')}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <View style={styles.routeLine}>
          <Text style={{ fontSize: 32 }}>🛵 ➔ ➔ 📍</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 8, color: '#242424' }}>
            {currentDelivery.address} бағыты
          </Text>
          <Text style={{ color: '#C67C4E', fontWeight: 'bold', marginTop: 4 }}>
            Төлем: $ {currentDelivery.total}
          </Text>
        </View>
      </View>

      <View style={styles.deliverySheet}>
        <Text style={styles.timeLeft}>{currentDelivery.timeLeft}</Text>
        <Text style={styles.deliveryTo}>
          Delivery to{' '}
          <Text style={{ fontWeight: 'bold', color: '#242424' }}>
            Шевченко 97
          </Text>
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressStep, { backgroundColor: '#36C07E' }]} />
          <View style={[styles.progressStep, { backgroundColor: '#36C07E' }]} />
          <View style={[styles.progressStep, { backgroundColor: '#36C07E' }]} />
          <View style={[styles.progressStep, { backgroundColor: '#E3E3E3' }]} />
        </View>

        <View style={styles.statusCard}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>📦</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
              Order confirmed
            </Text>
            <Text style={{ color: '#828282', fontSize: 12 }}>
              Тапсырысыңыз қабылданды және дайындалуда.
            </Text>
          </View>
        </View>

        <View style={styles.courierRow}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            }}
            style={styles.courierAvatar}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
              Brooklyn Simmons
            </Text>
            <Text style={{ color: '#828282', fontSize: 12 }}>
              Personal Courier
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() =>
              Alert.alert('Қоңырау', 'Курьерге қоңырау шалынуда...')
            }
          >
            <Text style={{ fontSize: 18 }}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  onboardingContainer: { flex: 1, backgroundColor: '#000' },
  onboardingBg: { width: '100%', height: '65%', resizeMode: 'cover' },
  onboardingOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
    backgroundColor: '#050505',
  },
  onboardingTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  onboardingSub: {
    color: '#A2A2A2',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#C67C4E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  darkHeader: {
    backgroundColor: '#131313',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  locLabel: { color: '#828282', fontSize: 12 },
  locText: { color: '#DDDDDD', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  searchRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    color: '#fff',
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#C67C4E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: -100,
  },
  promoImg: { width: '100%', height: '100%', position: 'absolute' },
  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'center',
  },
  promoBadge: {
    backgroundColor: '#ED5151',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  promoBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  promoTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  homeBody: { paddingHorizontal: 24, marginTop: 65 },
  catBtn: {
    backgroundColor: '#EDEDED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  catBtnActive: { backgroundColor: '#C67C4E' },
  catText: { color: '#313131', fontWeight: '600' },
  catTextActive: { color: '#fff' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#242424' },
  resetFilterText: { color: '#C67C4E', fontSize: 13, fontWeight: '600' },

  coffeeCardHorizontal: {
    backgroundColor: '#fff',
    width: 165,
    borderRadius: 16,
    padding: 10,
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImg: { width: '100%', height: 130, borderRadius: 12 },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#242424', marginTop: 8 },
  cardSub: { fontSize: 12, color: '#9B9B9B', marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: { fontSize: 17, fontWeight: 'bold', color: '#2F4B4E' },
  plusBtn: {
    backgroundColor: '#C67C4E',
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
  },
  cartNavBtn: { position: 'relative', paddingHorizontal: 6 },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#C67C4E',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  modalOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
  },
  modalChipActive: { backgroundColor: '#C67C4E' },
  modalChipText: { color: '#242424', fontSize: 13, fontWeight: '600' },
  modalChipTextActive: { color: '#fff' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  backBtn: { fontSize: 22, fontWeight: 'bold' },
  topBarTitle: { fontSize: 18, fontWeight: 'bold' },
  detailImg: { width: '100%', height: 220, borderRadius: 16, marginBottom: 16 },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#242424' },
  detailSub: { color: '#9B9B9B', fontSize: 12, marginVertical: 4 },
  detailRating: { fontSize: 15, fontWeight: 'bold' },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 16 },
  descText: { color: '#9B9B9B', lineHeight: 20, fontSize: 14 },
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sizeBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sizeBoxActive: { borderColor: '#C67C4E', backgroundColor: '#FFF5EE' },
  sizeText: { fontSize: 15, fontWeight: '600', color: '#242424' },
  sizeTextActive: { color: '#C67C4E' },
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
  },
  finalPrice: { fontSize: 20, fontWeight: 'bold', color: '#C67C4E' },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#C67C4E' },
  toggleText: { fontWeight: '600', color: '#242424' },
  toggleTextActive: { color: '#fff' },
  addrMain: { fontSize: 16, fontWeight: 'bold', color: '#242424' },
  addrSub: { fontSize: 13, color: '#828282', marginTop: 4 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  orderThumb: { width: 54, height: 54, borderRadius: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: '#242424', fontSize: 14 },
  summaryVal: { fontWeight: 'bold', fontSize: 14 },

  mapMock: {
    flex: 1,
    backgroundColor: '#E5E9EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBackBtn: {
    position: 'absolute',
    top: 40,
    left: 24,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  deliverySheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  timeLeft: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#242424',
  },
  deliveryTo: {
    fontSize: 13,
    color: '#828282',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  progressBar: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  progressStep: { flex: 1, height: 4, borderRadius: 2 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    marginBottom: 20,
  },
  courierRow: { flexDirection: 'row', alignItems: 'center' },
  courierAvatar: { width: 50, height: 50, borderRadius: 14 },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});