import { View, StyleSheet, TouchableOpacity, Text, Alert, ScrollView, FlatList } from 'react-native'
import { globalStyle, MAIN_COLOR, MUTED_COLOR } from '../../styles';
import { useState, useEffect } from 'react';
import { getAllCustomers, getAllServices, addTransaction } from '../services/api'
import { Dropdown } from 'react-native-element-dropdown';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import formatVND from '../utils/money';

const ServiceItem = ({ item, cus, onServiceChange }) => {
    const [isShow, setIsShow] = useState(false)
    const [quantity, setQuantity] = useState(1);
    const [executor, setExecutor] = useState('');

    const handleCheckboxChange = (isChecked) => {
        setIsShow(isChecked);
        if (isChecked) {
            onServiceChange(item._id, {
                _id: item._id,
                quantity: quantity,
                userId: executor,
                price: item.price
            });
        } else {
            onServiceChange(item._id, null);
        }
    };

    const updateParent = (newQty, newExecutor) => {
        if (isShow) {
            onServiceChange(item._id, {
                _id: item._id,
                quantity: newQty,
                userId: newExecutor,
                price: item.price
            });
        }
    }

    const increaseQty = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        updateParent(newQty, executor);
    };

    const decreaseQty = () => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            updateParent(newQty, executor);
        }
    };

    const handleExecutorChange = (selectedItem) => {
        setExecutor(selectedItem._id);
        updateParent(quantity, selectedItem._id);
    };

    return (
        <View style={{ marginVertical: 16 }}>
            <BouncyCheckbox
                size={25}
                fillColor="red"
                unFillColor="#FFFFFF"
                text={item.name}
                iconStyle={{ borderColor: "red" }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ fontFamily: "JosefinSans-Regular", textDecorationLine: "none" }}
                onPress={handleCheckboxChange}
            />
            {isShow &&
                <>
                    <View style={styles.service}>
                        <View style={styles.qtyContainer}>
                            <TouchableOpacity onPress={decreaseQty} style={styles.qtyButton}>
                                <Text style={styles.qtyActionText}>-</Text>
                            </TouchableOpacity>

                            <View style={styles.qtyButton}>
                                <Text style={styles.qtyText}>{quantity}</Text>
                            </View>

                            <TouchableOpacity onPress={increaseQty} style={styles.qtyButton}>
                                <Text style={styles.qtyActionText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <Dropdown
                            style={[styles.dropdown, { flex: 1, height: 50 }]}
                            data={cus}
                            search
                            labelField="name"
                            valueField="_id"
                            placeholder={'Executor'}
                            searchPlaceholder="Search..."
                            value={executor}
                            onChange={handleExecutorChange}
                        />
                    </View>
                    <Text style={{ paddingLeft: 35 }}>Price: <Text style={{ fontWeight: 'bold', color: MAIN_COLOR }}>{formatVND(item.price)}</Text></Text>
                </>
            }
        </View>
    )
}

const AddTran = ({ navigation, route }) => {
    const [cus, setCus] = useState([])
    const [selectCusId, setSelectCusId] = useState('')
    const [total, setTotal] = useState(0)
    const [ser, setSer] = useState([])
    const [selectedServices, setSelectedServices] = useState({});

    useEffect(() => {
        fetchUpdate()
    }, [])

    const fetchUpdate = async () => {
        try {
            const data = await getAllCustomers();
            const serData = await getAllServices();
            setCus(data)
            setSer(serData)
        } catch (error) {
            console.error(error)
        }
    }

    const handleServiceChange = (serviceId, serviceData) => {
        setSelectedServices(prev => {
            const updated = { ...prev };
            if (serviceData === null) {
                delete updated[serviceId];
            } else {
                updated[serviceId] = serviceData;
            }

            const newTotal = Object.values(updated).reduce((sum, service) => {
                return sum + (service.price * service.quantity);
            }, 0);
            setTotal(newTotal);

            return updated;
        });
    };

    const addTrans = async () => {
        if (!selectCusId) {
            Alert.alert('Error', 'Please select a customer');
            return;
        }

        const services = Object.values(selectedServices);
        console.log(services)
        if (services.length === 0) {
            Alert.alert('Error', 'Please select at least one service');
            return;
        }

        const hasInvalidService = services.some(service => !service.userId);
        if (hasInvalidService) {
            Alert.alert('Error', 'Please select an executor for all services');
            return;
        }

        try {
            const formattedServices = services.map(service => ({
                _id: service._id,
                quantity: service.quantity,
                userId: service.userId
            }));
            const res = await addTransaction(selectCusId, formattedServices);
            Alert.alert('Success', 'Transaction added successfully', [{
                text: 'OK',
                onPress: () => navigation.navigate('Main', { screen: 'Transaction' })
            }]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add transaction');
        }
    };

    const renderServiceItem = ({ item }) => (
        <ServiceItem
            item={item}
            cus={cus}
            onServiceChange={handleServiceChange}
        />
    );

    return (<ScrollView style={styles.container}>
        <Text style={styles.label}>Customer *</Text>
        <Dropdown
            style={styles.dropdown}
            data={cus}
            search
            maxHeight={300}
            labelField="name"
            valueField="_id"
            placeholder={'Select customer'}
            searchPlaceholder="Search..."
            value={selectCusId}
            onChange={item => {
                setSelectCusId(item._id);
            }}
        />
        <FlatList
            data={ser}
            keyExtractor={(item) => item._id}
            renderItem={renderServiceItem}
            scrollEnabled={false}
        />
        <TouchableOpacity style={[globalStyle.button, { backgroundColor: MAIN_COLOR, marginBottom: 30 }]} onPress={addTrans}>
            <Text style={globalStyle.buttonText}>See sumarry: ({formatVND(total)})</Text>
        </TouchableOpacity>
    </ScrollView>)
}

export default AddTran;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 5,
        backgroundColor: 'white'
    },
    label: {
        fontWeight: 'bold'
    },
    dropdown: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        borderColor: 'gray',
        borderWidth: 0.5
    },
    service: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10, // Increased gap slightly
        paddingLeft: 35,
        marginBottom: 5
    },

    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        height: 40,
        gap: 2
    },
    qtyButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: MUTED_COLOR,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    qtyActionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black'
    },
    qtyText: {
        minWidth: 30,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500'
    }
})