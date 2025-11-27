import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native"
import { deleteTransaction, getTransaction } from '../services/api'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { MAIN_COLOR, MUTED_COLOR } from '../../styles'
import formatVND from '../utils/money'

const TranDetail = ({ route, navigation }) => {
    const { id } = route.params;
    const [tran, setTran] = useState({})
    const [discount, setDiscount] = useState(0)

    const InfoRow = ({ label, value, isMain = false, isDiscount = false }) => (
        <View style={styles.rowContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueWrapper}>
                <Text style={[
                    isMain ? styles.boldMain : styles.bold,
                    isDiscount && { color: 'red' }
                ]}>
                    {value}
                </Text>
            </View>
        </View>
    );

    const ServiceRow = ({ name, quantity, price }) => (
        <View style={styles.rowContainer}>
            <Text style={styles.serviceName}>{name}</Text>
            <View style={styles.serviceRightSide}>
                <Text style={styles.serviceQty}>x{quantity}</Text>
                <Text style={styles.bold}>{formatVND(price)}</Text>
            </View>
        </View>
    );

    const handleDelete = () => {
        Alert.alert(
            'Warning',
            'Are you sure you want to cancel this transaction? This will affect the customer transaction information',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTransaction(id);
                            Alert.alert('Success', 'Transaction cancelled successfully');
                            navigation.navigate('Main', { screen: 'Transaction' });
                        } catch (error) {
                            console.error('Error cancelling transaction:', error);
                        }
                    }
                }
            ]
        );
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Menu>
                    <MenuTrigger>
                        <MaterialDesignIcons name="dots-vertical" size={30} color="#fff" />
                    </MenuTrigger>
                    <MenuOptions>
                        <MenuOption>
                            <View style={styles.menuItem}>
                                <Text style={styles.menuText}>See more details</Text>
                            </View>
                        </MenuOption>
                        <MenuOption onSelect={handleDelete}>
                            <View style={styles.menuItem}>
                                <Text style={[styles.menuText, { color: 'red' }]}>Cancel transaction</Text>
                            </View>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            )
        });
    }, [navigation]);

    useEffect(() => {
        fetchATran();
    }, [])

    const fetchATran = async () => {
        try {
            const response = await getTransaction(id);
            setTran(response)
            const before = response.priceBeforePromotion || 0;
            const after = response.price || 0;
            setDiscount(before - after);
        } catch (error) {
            console.error("Error while loading data: ", error)
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.sectionContainer}>
                <View style={styles.innerPadding}>
                    <Text style={[styles.headerTitle, { marginBottom: 12 }]}>General Information</Text>
                    <View style={styles.gap}>
                        <InfoRow
                            label="Transaction code"
                            value={tran.id}
                        />
                        <InfoRow
                            label="Customer"
                            value={tran.customer ? `${tran.customer.name} - ${tran.customer.phone}` : 'N/A'}
                        />
                        <InfoRow
                            label="Creation time"
                            value={tran.createdAt ? new Date(tran.createdAt).toLocaleString() : '...'}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <View style={styles.innerPadding}>
                    <Text style={[styles.headerTitle, { marginBottom: 12 }]}>Service list</Text>

                    <View style={styles.gap}>
                        {tran.services?.map((service) => (
                            <ServiceRow
                                key={service._id}
                                name={service.name}
                                quantity={service.quantity}
                                price={service.price}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.innerDivider} />

                <View style={styles.innerPadding}>
                    <InfoRow
                        label="Total"
                        value={formatVND(tran.priceBeforePromotion)}
                    />
                </View>
            </View>

            <View style={styles.sectionContainer}>
                <View style={styles.innerPadding}>
                    <Text style={[styles.headerTitle, { marginBottom: 12 }]}>Cost</Text>

                    <View style={styles.gap}>
                        <InfoRow
                            label="Account of money"
                            value={formatVND(tran.priceBeforePromotion)}
                        />
                        <InfoRow
                            label="Discount"
                            value={`- ${formatVND(discount)}`}

                        />
                    </View>
                </View>

                <View style={styles.innerDivider} />

                <View style={styles.innerPadding}>
                    <InfoRow
                        label="Total payment"
                        value={formatVND(tran.price)}
                        isMain={true}
                    />
                </View>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },
    sectionContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
    },
    innerPadding: {
        padding: 16,
    },
    innerDivider: {
        height: 1,
        backgroundColor: MUTED_COLOR,
        marginHorizontal: 16,
        opacity: 0.2,
    },
    gap: {
        gap: 12,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontWeight: 'bold',
        color: MUTED_COLOR,
    },
    valueWrapper: {
        flex: 1,
        alignItems: 'flex-end',
    },
    serviceName: {
        flex: 1,
        marginRight: 8,
        color: '#000',
    },
    serviceRightSide: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    serviceQty: {
        color: MUTED_COLOR,
        fontWeight: 'bold',
    },

    headerTitle: {
        fontWeight: 'bold',
        color: MUTED_COLOR,
        fontSize: 16
    },
    bold: {
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#000',
    },
    boldMain: {
        fontWeight: 'bold',
        color: MAIN_COLOR,
        fontSize: 18,
        textAlign: 'right',
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8
    },
    menuText: {
        marginLeft: 10,
        fontSize: 16
    }
});

export default TranDetail;