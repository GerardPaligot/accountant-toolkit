// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface Account
 */
export interface Account {
    /**
     * The account ID.
     * @type {string}
     * @memberof Account
     */
    id: string;
    /**
     * The account name.
     * @type {string}
     * @memberof Account
     */
    name?: string;
    /**
     * The current balance on the account.
     * @type {number}
     * @memberof Account
     */
    balance: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof Account
     */
    currency: string;
    /**
     * Indicates the state of the account.
     * @type {string}
     * @memberof Account
     */
    state: AccountStateEnum;
    /**
     * Indicates whether the account is visible to other businesses on Revolut.
     * @type {boolean}
     * @memberof Account
     */
    _public: boolean;
    /**
     * The date and time the account was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Account
     */
    createdAt: string;
    /**
     * The date and time the account was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Account
     */
    updatedAt: string;
}


/**
 * @export
 */
export const AccountStateEnum = {
    Active: 'active',
    Inactive: 'inactive'
} as const;
export type AccountStateEnum = typeof AccountStateEnum[keyof typeof AccountStateEnum];

/**
 * 
 * @export
 * @interface AccountBankDetailsItem
 */
export interface AccountBankDetailsItem {
    /**
     * The IBAN number.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    iban?: string;
    /**
     * The BIC number, also known as SWIFT code.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    bic?: string;
    /**
     * The account number.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    accountNo?: string;
    /**
     * The sort code of the account.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    sortCode?: string;
    /**
     * The routing number of the account.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    routingNumber?: string;
    /**
     * The name of the counterparty.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    beneficiary: string;
    /**
     * 
     * @type {BeneficiaryAddress}
     * @memberof AccountBankDetailsItem
     */
    beneficiaryAddress: BeneficiaryAddress;
    /**
     * The country of the bank, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    bankCountry?: string;
    /**
     * Indicates whether the account address is pooled or unique.
     * @type {boolean}
     * @memberof AccountBankDetailsItem
     */
    pooled?: boolean;
    /**
     * The reference of the pooled account.
     * @type {string}
     * @memberof AccountBankDetailsItem
     */
    uniqueReference?: string;
    /**
     * The schemes that are available for this currency account.
     * @type {Array<PaymentSystem>}
     * @memberof AccountBankDetailsItem
     */
    schemes: Array<PaymentSystem>;
    /**
     * 
     * @type {EstimatedTime}
     * @memberof AccountBankDetailsItem
     */
    estimatedTime: EstimatedTime;
}
/**
 * A code which explains why a given result was returned, and the service that returned it.
 * In some cases, it may provide more details about the result.
 * @export
 * @interface AccountNameValidationReasonAU
 */
export interface AccountNameValidationReasonAU {
    /**
     * The reason type.
     * Determines the [service](https://developer.revolut.com/docs/guides/manage-accounts/counterparties/confirmation-of-payee#supported-regions-and-services) used for the validation that returned the reason code.
     * For AU, the value is: `au_cop`.
     * @type {string}
     * @memberof AccountNameValidationReasonAU
     */
    type?: AccountNameValidationReasonAUTypeEnum;
    /**
     * The reason code. Possible values for AU:
     * - **`close_match`** (business accounts): The provided name is similar to the account name.
     *   The actual name is returned. Mismatched account type is corrected.
     * - **`not_matched`**: The account details don't match the provided values.
     * - **`account_does_not_exist`**: The account does not exist.
     * - **`account_switched`**: The account has been switched using the Current Account Switching Service.
     *   Please contact the recipient for updated account details.
     * - **`cannot_be_checked`**: The account cannot be checked.
     * @type {string}
     * @memberof AccountNameValidationReasonAU
     */
    code?: AccountNameValidationReasonAUCodeEnum;
}


/**
 * @export
 */
export const AccountNameValidationReasonAUTypeEnum = {
    UkCop: 'uk_cop',
    EuCop: 'eu_cop',
    RoCop: 'ro_cop',
    AuCop: 'au_cop'
} as const;
export type AccountNameValidationReasonAUTypeEnum = typeof AccountNameValidationReasonAUTypeEnum[keyof typeof AccountNameValidationReasonAUTypeEnum];

/**
 * @export
 */
export const AccountNameValidationReasonAUCodeEnum = {
    CloseMatch: 'close_match',
    IndividualAccountNameMatched: 'individual_account_name_matched',
    CompanyAccountNameMatched: 'company_account_name_matched',
    IndividualAccountCloseMatch: 'individual_account_close_match',
    CompanyAccountCloseMatch: 'company_account_close_match',
    NotMatched: 'not_matched',
    AccountDoesNotExist: 'account_does_not_exist',
    AccountSwitched: 'account_switched',
    CannotBeChecked: 'cannot_be_checked'
} as const;
export type AccountNameValidationReasonAUCodeEnum = typeof AccountNameValidationReasonAUCodeEnum[keyof typeof AccountNameValidationReasonAUCodeEnum];

/**
 * A code which explains why a given result was returned, and the service that returned it.
 * For example, it might happen that the details you provided match the account details, but you specified the counterparty as an individual, and the account type is business.
 * @export
 * @interface AccountNameValidationReasonEUR
 */
export interface AccountNameValidationReasonEUR {
    /**
     * The reason type.
     * Determines the [service](https://developer.revolut.com/docs/guides/manage-accounts/counterparties/confirmation-of-payee#supported-regions-and-services) used for the validation that returned the reason code.
     * For EUR, the value is: `eu_cop`.
     * @type {string}
     * @memberof AccountNameValidationReasonEUR
     */
    type?: AccountNameValidationReasonEURTypeEnum;
    /**
     * The reason code. Possible values for EUR:
     * - **`close_match`**: The provided name is similar to the account name.
     *   The actual name is returned.
     * - **`not_matched`**: The account details don't match the provided values.
     * - **`account_does_not_exist`**: The account does not exist.
     * - **`account_switched`**: The account has been switched using the Current Account Switching Service.
     *   Please contact the recipient for updated account details.
     * - **`cannot_be_checked`**: The account cannot be checked.
     * @type {string}
     * @memberof AccountNameValidationReasonEUR
     */
    code?: AccountNameValidationReasonEURCodeEnum;
}


/**
 * @export
 */
export const AccountNameValidationReasonEURTypeEnum = {
    UkCop: 'uk_cop',
    EuCop: 'eu_cop',
    RoCop: 'ro_cop',
    AuCop: 'au_cop'
} as const;
export type AccountNameValidationReasonEURTypeEnum = typeof AccountNameValidationReasonEURTypeEnum[keyof typeof AccountNameValidationReasonEURTypeEnum];

/**
 * @export
 */
export const AccountNameValidationReasonEURCodeEnum = {
    CloseMatch: 'close_match',
    IndividualAccountNameMatched: 'individual_account_name_matched',
    CompanyAccountNameMatched: 'company_account_name_matched',
    IndividualAccountCloseMatch: 'individual_account_close_match',
    CompanyAccountCloseMatch: 'company_account_close_match',
    NotMatched: 'not_matched',
    AccountDoesNotExist: 'account_does_not_exist',
    AccountSwitched: 'account_switched',
    CannotBeChecked: 'cannot_be_checked'
} as const;
export type AccountNameValidationReasonEURCodeEnum = typeof AccountNameValidationReasonEURCodeEnum[keyof typeof AccountNameValidationReasonEURCodeEnum];

/**
 * A code which explains why a given result was returned, and the service that returned it.
 * @export
 * @interface AccountNameValidationReasonRO
 */
export interface AccountNameValidationReasonRO {
    /**
     * The reason type.
     * Determines the [service](https://developer.revolut.com/docs/guides/manage-accounts/counterparties/confirmation-of-payee#supported-regions-and-services) used for the validation that returned the reason code.
     * For RO, the value is: `ro_cop`.
     * @type {string}
     * @memberof AccountNameValidationReasonRO
     */
    type?: AccountNameValidationReasonROTypeEnum;
    /**
     * The reason code. Possible values for RO:
     * - **`cannot_be_checked`**: The account cannot be checked.
     * @type {string}
     * @memberof AccountNameValidationReasonRO
     */
    code?: AccountNameValidationReasonROCodeEnum;
}


/**
 * @export
 */
export const AccountNameValidationReasonROTypeEnum = {
    UkCop: 'uk_cop',
    EuCop: 'eu_cop',
    RoCop: 'ro_cop',
    AuCop: 'au_cop'
} as const;
export type AccountNameValidationReasonROTypeEnum = typeof AccountNameValidationReasonROTypeEnum[keyof typeof AccountNameValidationReasonROTypeEnum];

/**
 * @export
 */
export const AccountNameValidationReasonROCodeEnum = {
    CloseMatch: 'close_match',
    IndividualAccountNameMatched: 'individual_account_name_matched',
    CompanyAccountNameMatched: 'company_account_name_matched',
    IndividualAccountCloseMatch: 'individual_account_close_match',
    CompanyAccountCloseMatch: 'company_account_close_match',
    NotMatched: 'not_matched',
    AccountDoesNotExist: 'account_does_not_exist',
    AccountSwitched: 'account_switched',
    CannotBeChecked: 'cannot_be_checked'
} as const;
export type AccountNameValidationReasonROCodeEnum = typeof AccountNameValidationReasonROCodeEnum[keyof typeof AccountNameValidationReasonROCodeEnum];

/**
 * A code which explains why a given result was returned, and the service that returned it.
 * For example, it might happen that the details you provided match the account details, but you specified the counterparty as an individual, and the account type is business.
 * @export
 * @interface AccountNameValidationReasonUK
 */
export interface AccountNameValidationReasonUK {
    /**
     * The reason type.
     * Determines the [service](https://developer.revolut.com/docs/guides/manage-accounts/counterparties/confirmation-of-payee#supported-regions-and-services) used for the validation that returned the reason code.
     * For UK, the values is: `uk_cop`.
     * @type {string}
     * @memberof AccountNameValidationReasonUK
     */
    type?: AccountNameValidationReasonUKTypeEnum;
    /**
     * The reason code. Possible values for UK:
     * - **`close_match`**: The provided name is similar to the account name, the account type is correct.
     *   The actual name is returned.
     * - **`individual_account_name_matched`**: The names match but the counterparty is an individual, not a business.
     * - **`company_account_name_matched`**: The names match but the counterparty is a business, not an individual.
     * - **`individual_account_close_match`**: The provided name is similar to the account name, and the account type is incorrect – the counterparty is an individual, not a business.
     *   The actual name is returned.
     * - **`company_account_close_match`**: The provided name is similar to the account name, and the account type is incorrect - the counterparty is a business, not an individual.
     *   The actual name is returned.
     * - **`not_matched`**: The account details don't match the provided values.
     * - **`account_does_not_exist`**: The account does not exist.
     * - **`account_switched`**: The account has been switched using the Current Account Switching Service.
     *   Please contact the recipient for updated account details.
     * - **`cannot_be_checked`**: The account cannot be checked.
     * @type {string}
     * @memberof AccountNameValidationReasonUK
     */
    code?: AccountNameValidationReasonUKCodeEnum;
}


/**
 * @export
 */
export const AccountNameValidationReasonUKTypeEnum = {
    UkCop: 'uk_cop',
    EuCop: 'eu_cop',
    RoCop: 'ro_cop',
    AuCop: 'au_cop'
} as const;
export type AccountNameValidationReasonUKTypeEnum = typeof AccountNameValidationReasonUKTypeEnum[keyof typeof AccountNameValidationReasonUKTypeEnum];

/**
 * @export
 */
export const AccountNameValidationReasonUKCodeEnum = {
    CloseMatch: 'close_match',
    IndividualAccountNameMatched: 'individual_account_name_matched',
    CompanyAccountNameMatched: 'company_account_name_matched',
    IndividualAccountCloseMatch: 'individual_account_close_match',
    CompanyAccountCloseMatch: 'company_account_close_match',
    NotMatched: 'not_matched',
    AccountDoesNotExist: 'account_does_not_exist',
    AccountSwitched: 'account_switched',
    CannotBeChecked: 'cannot_be_checked'
} as const;
export type AccountNameValidationReasonUKCodeEnum = typeof AccountNameValidationReasonUKCodeEnum[keyof typeof AccountNameValidationReasonUKCodeEnum];

/**
 * 
 * @export
 * @interface AccountingCategoryResponse
 */
export interface AccountingCategoryResponse {
    /**
     * The unique ID of the accounting category.
     * @type {string}
     * @memberof AccountingCategoryResponse
     */
    id: string;
    /**
     * The name of the accounting category.
     * @type {string}
     * @memberof AccountingCategoryResponse
     */
    name: string;
    /**
     * The code of the accounting category.
     * @type {string}
     * @memberof AccountingCategoryResponse
     */
    code?: string;
    /**
     * The date and time the accounting category was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof AccountingCategoryResponse
     */
    createdAt: string;
    /**
     * The date and time the accounting category was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof AccountingCategoryResponse
     */
    updatedAt: string;
    /**
     * The ID of the default [tax rate](https://developer.revolut.com/docs/business/get-tax-rate) applied to items in this accounting category unless overridden for a specific item.
     * @type {string}
     * @memberof AccountingCategoryResponse
     */
    defaultTaxRateId?: string;
}
/**
 * The tax rate that can be applied to financial records, such as expenses.
 * @export
 * @interface AccountingTaxRate
 */
export interface AccountingTaxRate {
    /**
     * The name of the tax.
     * @type {string}
     * @memberof AccountingTaxRate
     */
    name: string;
    /**
     * The tax rate percentage applied to the taxable amount. For example, `23` for 23%.
     * @type {number}
     * @memberof AccountingTaxRate
     */
    percentage?: number;
}
/**
 * 
 * @export
 * @interface AmountWithCurrency
 */
export interface AmountWithCurrency {
    /**
     * The amount of the transaction.
     * @type {number}
     * @memberof AmountWithCurrency
     */
    amount?: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof AmountWithCurrency
     */
    currency?: string;
}
/**
 * The address of the counterparty.
 * @export
 * @interface BeneficiaryAddress
 */
export interface BeneficiaryAddress {
    /**
     * Street line 1 information.
     * @type {string}
     * @memberof BeneficiaryAddress
     */
    streetLine1?: string;
    /**
     * Street line 2 information.
     * @type {string}
     * @memberof BeneficiaryAddress
     */
    streetLine2?: string;
    /**
     * The name of the region (state or province), for example, Ontario for Canada.
     * @type {string}
     * @memberof BeneficiaryAddress
     */
    region?: string;
    /**
     * The name of the city.
     * @type {string}
     * @memberof BeneficiaryAddress
     */
    city?: string;
    /**
     * The country of the counterparty, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof BeneficiaryAddress
     */
    country: string;
    /**
     * The postcode of the counterparty address.
     * @type {string}
     * @memberof BeneficiaryAddress
     */
    postcode: string;
}

/**
 * 
 * @export
 */
export const BusinessMerchantCategory = {
    Health: 'health',
    General: 'general',
    Services: 'services',
    Airlines: 'airlines',
    Transport: 'transport',
    Accommodation: 'accommodation',
    Utilities: 'utilities',
    Shopping: 'shopping',
    Financial: 'financial',
    Furniture: 'furniture',
    Hardware: 'hardware',
    Groceries: 'groceries',
    Fuel: 'fuel',
    Entertainment: 'entertainment',
    Software: 'software',
    Restaurants: 'restaurants',
    Advertising: 'advertising',
    Cash: 'cash',
    Education: 'education',
    Government: 'government'
} as const;
export type BusinessMerchantCategory = typeof BusinessMerchantCategory[keyof typeof BusinessMerchantCategory];

/**
 * 
 * @export
 * @interface CardCreatedResponse
 */
export interface CardCreatedResponse {
    /**
     * The ID of the card.
     * @type {string}
     * @memberof CardCreatedResponse
     */
    id: string;
    /**
     * The ID of the team member who is the holder of the card.
     * If the card belongs to the business, this will be empty.
     * 
     * For more information, see the guides: [Manage Cards - Create a virtual card](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#create-a-virtual-card).
     * @type {string}
     * @memberof CardCreatedResponse
     */
    holderId?: string;
    /**
     * The list of contacts for a [company card](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards).
     * @type {Set<string>}
     * @memberof CardCreatedResponse
     */
    contactIds?: Set<string>;
    /**
     * The date and time the card was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardCreatedResponse
     */
    createdAt: string;
    /**
     * The date and time the card was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardCreatedResponse
     */
    updatedAt: string;
    /**
     * 
     * @type {CardProduct}
     * @memberof CardCreatedResponse
     */
    product?: CardProduct;
    /**
     * Specifies whether the card is virtual (`true`) or physical (`false`).
     * @type {boolean}
     * @memberof CardCreatedResponse
     */
    virtual: boolean;
    /**
     * The last 4 digits of the card's PAN.
     * @type {string}
     * @memberof CardCreatedResponse
     */
    lastDigits: string;
    /**
     * The card expiration date.
     * @type {string}
     * @memberof CardCreatedResponse
     */
    expiry: string;
    /**
     * The label of the card.
     * @type {string}
     * @memberof CardCreatedResponse
     */
    label?: string;
    /**
     * References for the card.
     * Up to 5 name-value pairs assigned to the card for tracking.
     * 
     * :::info
     * Each time the card is used, the references are recorded in the [transaction details](https://developer.revolut.com/docs/business/get-transaction#response) (`card.references`), helping track transactions made with this card.
     * :::
     * 
     * The names must be unique.
     * The references can be [amended](https://developer.revolut.com/docs/business/update-card-references) up to 10 times.
     * 
     * References are only supported for cards owned by the business (i.e. [company](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) or [auto-issued cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards)).
     * They are **not** supported for [team member cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (i.e. with `holder_id` present).
     * 
     * :::note
     * The references recorded on a transaction are those assigned to the card at the time the transaction took place.
     * If the references are amended, they will only be applied to future transactions.
     * Existing transaction are not affected.
     * :::
     * @type {Set<CardReference>}
     * @memberof CardCreatedResponse
     */
    references?: Set<CardReference>;
    /**
     * 
     * @type {CardState}
     * @memberof CardCreatedResponse
     */
    state: CardState;
    /**
     * Returned for locked cards (`state=locked`).
     * Indicates whether the card can be [unlocked](https://developer.revolut.com/docs/business/unlock-card) manually (via API or in-app).
     * If `true`, you'll still need the [necessary scope or permission](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#lock-or-unlock-cards) to unlock the card.
     * 
     * :::info
     * Cards can be locked for various reasons.
     * For example, a card can be locked by the user, due to spending period settings, or automatically by the system.
     * Only certain types of lock can be lifted manually.
     * :::
     * @type {boolean}
     * @memberof CardCreatedResponse
     */
    canBeUnlocked?: boolean;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CardCreatedResponse
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They specify the dates when the card becomes available or unavailable for spending, and define what happens after the end date.
     * @type {SpendingPeriodSchema}
     * @memberof CardCreatedResponse
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories that are available for card spending.             
     * If this parameter is not specified, categories are not restricted.
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CardCreatedResponse
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CardCreatedResponse
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the card can be used, specified as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CardCreatedResponse
     */
    countries?: Array<string>;
    /**
     * The list of linked accounts.
     * @type {Array<string>}
     * @memberof CardCreatedResponse
     */
    accounts: Array<string>;
}


/**
 * 
 * @export
 * @interface CardInvitationCreatedResponse
 */
export interface CardInvitationCreatedResponse {
    /**
     * The ID of the card invitation.
     * @type {string}
     * @memberof CardInvitationCreatedResponse
     */
    id: string;
    /**
     * 
     * @type {CardInvitationState}
     * @memberof CardInvitationCreatedResponse
     */
    state: CardInvitationState;
    /**
     * The date and time the card invitation was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardInvitationCreatedResponse
     */
    createdAt: string;
    /**
     * The date and time the card invitation was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardInvitationCreatedResponse
     */
    updatedAt: string;
    /**
     * The date and time after which this card invitation expires if not claimed or cancelled before then.
     * Specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * ::::::note
     * Only returned for invitations in state `created`.
     * :::tip
     * For other states, to find out when a card invitation transitioned to its [final state](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-card-invitations#card-invitation-state), check the `updated_at` value. 
     * :::
     * ::::::
     * @type {string}
     * @memberof CardInvitationCreatedResponse
     */
    expiryDate?: string;
    /**
     * The ID of the team member to be assigned as the holder of the card after the invitation is claimed.
     * @type {string}
     * @memberof CardInvitationCreatedResponse
     */
    holderId?: string;
    /**
     * Specifies whether the issued card will be a virtual (`true`) or physical (`false`) one.
     * @type {boolean}
     * @memberof CardInvitationCreatedResponse
     */
    virtual: boolean;
    /**
     * The label of the card.
     * @type {string}
     * @memberof CardInvitationCreatedResponse
     */
    label?: string;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CardInvitationCreatedResponse
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They specify the dates when the card will become available or unavailable for spending, and define what happens after the end date.
     * @type {SpendingPeriodSchema}
     * @memberof CardInvitationCreatedResponse
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories that will be available for card spending.             
     * If this parameter is not specified, categories are not restricted.
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CardInvitationCreatedResponse
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CardInvitationCreatedResponse
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the team member will be able to use the card.
     * Specified as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CardInvitationCreatedResponse
     */
    countries?: Array<string>;
    /**
     * The list of accounts that will be linked to the card.
     * @type {Array<string>}
     * @memberof CardInvitationCreatedResponse
     */
    accounts: Array<string>;
}


/**
 * 
 * @export
 * @interface CardInvitationMerchantControls
 */
export interface CardInvitationMerchantControls {
    [key: string]: NULL_SCHEMA_ERR;
}
/**
 * 
 * @export
 * @interface CardInvitationResponse
 */
export interface CardInvitationResponse {
    /**
     * The ID of the card invitation.
     * @type {string}
     * @memberof CardInvitationResponse
     */
    id: string;
    /**
     * 
     * @type {CardInvitationState}
     * @memberof CardInvitationResponse
     */
    state: CardInvitationState;
    /**
     * The date and time the card invitation was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardInvitationResponse
     */
    createdAt: string;
    /**
     * The date and time the card invitation was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardInvitationResponse
     */
    updatedAt: string;
    /**
     * The date and time after which this card invitation expires if not claimed or cancelled before then.
     * Specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * ::::::note
     * Only returned for invitations in state `created`.
     * :::tip
     * For other states, to find out when a card invitation transitioned to its [final state](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-card-invitations#card-invitation-state), check the `updated_at` value. 
     * :::
     * ::::::
     * @type {string}
     * @memberof CardInvitationResponse
     */
    expiryDate?: string;
    /**
     * The ID of the card issued after this invitation was claimed. 
     * :::note
     * Only returned for invitations in state `redeemed`.
     * :::
     * 
     * @type {string}
     * @memberof CardInvitationResponse
     */
    cardId?: string;
    /**
     * The ID of the team member to be assigned as the holder of the card after the invitation is claimed.
     * 
     * :::note
     * If the team member has been deleted since the invitation was created, the `holder_id` is not returned.
     * :::
     * @type {string}
     * @memberof CardInvitationResponse
     */
    holderId?: string;
    /**
     * Specifies whether the issued card will be a virtual (`true`) or physical (`false`) one.
     * @type {boolean}
     * @memberof CardInvitationResponse
     */
    virtual: boolean;
    /**
     * The label of the card.
     * @type {string}
     * @memberof CardInvitationResponse
     */
    label?: string;
    /**
     * 
     * @type {SpendProgram}
     * @memberof CardInvitationResponse
     */
    spendProgram?: SpendProgram;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CardInvitationResponse
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They specify the dates when the card will become available or unavailable for spending, and define what happens after the end date.
     * @type {SpendingPeriodSchema}
     * @memberof CardInvitationResponse
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories that will be available for card spending.             
     * If this parameter is not specified, categories are not restricted.
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CardInvitationResponse
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CardInvitationResponse
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the team member will be able to use the card.
     * Specified as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CardInvitationResponse
     */
    countries?: Array<string>;
    /**
     * The list of accounts that will be linked to the card.
     * @type {Array<string>}
     * @memberof CardInvitationResponse
     */
    accounts: Array<string>;
}


/**
 * The controls for the card's spending period.
 * 
 * They specify the dates when the card will become available or unavailable for spending, and define what happens after the end date.
 * @export
 * @interface CardInvitationSpendingPeriod
 */
export interface CardInvitationSpendingPeriod {
    /**
     * The start date (inclusive) of the spending period, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DD`).
     * Uses the [timezone set by the business](https://business.revolut.com/settings/appearance), or defaults to `Europe/London`.
     * @type {string}
     * @memberof CardInvitationSpendingPeriod
     */
    startDate?: string;
    /**
     * The end date (inclusive) of the spending period, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DD`).
     * Uses the [timezone set by the business](https://business.revolut.com/settings/appearance), or defaults to `Europe/London`.
     * @type {string}
     * @memberof CardInvitationSpendingPeriod
     */
    endDate?: string;
    /**
     * The action to take after the end date of the spending period.
     * @type {string}
     * @memberof CardInvitationSpendingPeriod
     */
    endDateAction?: CardInvitationSpendingPeriodEndDateActionEnum;
}


/**
 * @export
 */
export const CardInvitationSpendingPeriodEndDateActionEnum = {
    Lock: 'lock',
    Terminate: 'terminate'
} as const;
export type CardInvitationSpendingPeriodEndDateActionEnum = typeof CardInvitationSpendingPeriodEndDateActionEnum[keyof typeof CardInvitationSpendingPeriodEndDateActionEnum];


/**
 * The current state of the card invitation:
 * - **`created`**: Invitation has been created but not yet claimed.
 * - **`expired`**: Invitation has expired due to expiry date being reached or manual cancellation.
 * - **`failed`**: Invitation claim attempt failed.
 * - **`redeemed`**: Invitation has been successfully claimed.
 * 
 * To learn more about card invitation lifecycle, see the guide: [Manage card invitations → Card invitation state](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-card-invitations#card-invitation-state).
 * @export
 */
export const CardInvitationState = {
    Created: 'created',
    Expired: 'expired',
    Failed: 'failed',
    Redeemed: 'redeemed'
} as const;
export type CardInvitationState = typeof CardInvitationState[keyof typeof CardInvitationState];

/**
 * 
 * @export
 * @interface CardInvitationUpdatedResponse
 */
export interface CardInvitationUpdatedResponse {
    /**
     * The ID of the card invitation.
     * @type {string}
     * @memberof CardInvitationUpdatedResponse
     */
    id: string;
    /**
     * 
     * @type {CardInvitationState}
     * @memberof CardInvitationUpdatedResponse
     */
    state: CardInvitationState;
    /**
     * The date and time the card invitation was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardInvitationUpdatedResponse
     */
    createdAt: string;
    /**
     * The date and time the card invitation was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardInvitationUpdatedResponse
     */
    updatedAt: string;
    /**
     * The date and time after which this card invitation expires if not claimed or cancelled before then.
     * Specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * ::::::note
     * Only returned for invitations in state `created`.
     * :::tip
     * For other states, to find out when a card invitation transitioned to its [final state](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-card-invitations#card-invitation-state), check the `updated_at` value. 
     * :::
     * ::::::
     * @type {string}
     * @memberof CardInvitationUpdatedResponse
     */
    expiryDate?: string;
    /**
     * The ID of the team member to be assigned as the holder of the card after the invitation is claimed.
     * @type {string}
     * @memberof CardInvitationUpdatedResponse
     */
    holderId?: string;
    /**
     * Specifies whether the issued card will be a virtual (`true`) or physical (`false`) one.
     * @type {boolean}
     * @memberof CardInvitationUpdatedResponse
     */
    virtual: boolean;
    /**
     * The label of the card.
     * @type {string}
     * @memberof CardInvitationUpdatedResponse
     */
    label?: string;
    /**
     * 
     * @type {SpendProgram}
     * @memberof CardInvitationUpdatedResponse
     */
    spendProgram?: SpendProgram;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CardInvitationUpdatedResponse
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They specify the dates when the card will become available or unavailable for spending, and define what happens after the end date.
     * @type {SpendingPeriodSchema}
     * @memberof CardInvitationUpdatedResponse
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories that will be available for card spending.             
     * If this parameter is not specified, categories are not restricted.
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CardInvitationUpdatedResponse
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CardInvitationUpdatedResponse
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the team member will be able to use the card.
     * Specified as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CardInvitationUpdatedResponse
     */
    countries?: Array<string>;
    /**
     * The list of accounts that will be linked to the card.
     * @type {Array<string>}
     * @memberof CardInvitationUpdatedResponse
     */
    accounts: Array<string>;
}


/**
 * The card product offered by the card provider for this card.
 * In other words, the program that the card was issued under.
 * 
 * :::note
 * This property is only available to travel intermediaries using our travel solution.
 * To use it, please contact [Revolut API Support](mailto:api-requests@revolut.com).
 * :::
 * @export
 * @interface CardProduct
 */
export interface CardProduct {
    /**
     * The code of the card product.
     * @type {string}
     * @memberof CardProduct
     */
    code: string;
}
/**
 * Reference for the card.
 * One of the name-value pairs assigned to the card for tracking.
 * 
 * :::info
 * Each time the card is used, the references are recorded in the [transaction details](https://developer.revolut.com/docs/business/get-transaction#response) (`card.references`), helping track transactions made with this card.
 * :::
 * 
 * The names must be unique.
 * The references can be [amended](https://developer.revolut.com/docs/business/update-card-references) up to 10 times.
 * References are only supported for cards owned by the business (i.e. [company](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) or [auto-issued cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards)).
 * They are **not** supported for [team member cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (i.e. with `holder_id` present). 
 * 
 * :::note
 * The references recorded on a transaction are those assigned to the card at the time the transaction took place.
 * If the references are amended, the new references are only applied to future transactions.
 * Existing transaction are not affected.
 * :::
 * @export
 * @interface CardReference
 */
export interface CardReference {
    /**
     * The name of the card reference.
     * Must be unique.
     * @type {string}
     * @memberof CardReference
     */
    name: string;
    /**
     * The value for this reference.
     * @type {string}
     * @memberof CardReference
     */
    value: string;
}
/**
 * 
 * @export
 * @interface CardResponse
 */
export interface CardResponse {
    /**
     * The ID of the card.
     * @type {string}
     * @memberof CardResponse
     */
    id: string;
    /**
     * The ID of the team member who is the holder of the card.
     * If the card belongs to the business, this will be empty.
     * 
     * For more information, see the guides: [Manage Cards - Create a virtual card](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#create-a-virtual-card).
     * @type {string}
     * @memberof CardResponse
     */
    holderId?: string;
    /**
     * The list of contacts for a [company card](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards).
     * @type {Set<string>}
     * @memberof CardResponse
     */
    contactIds?: Set<string>;
    /**
     * The date and time the card was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardResponse
     */
    createdAt: string;
    /**
     * The date and time the card was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CardResponse
     */
    updatedAt: string;
    /**
     * 
     * @type {CardProduct}
     * @memberof CardResponse
     */
    product?: CardProduct;
    /**
     * Specifies whether the card is virtual (`true`) or physical (`false`).
     * @type {boolean}
     * @memberof CardResponse
     */
    virtual: boolean;
    /**
     * The last 4 digits of the card's PAN.
     * @type {string}
     * @memberof CardResponse
     */
    lastDigits: string;
    /**
     * The card expiration date.
     * @type {string}
     * @memberof CardResponse
     */
    expiry: string;
    /**
     * The label of the card.
     * @type {string}
     * @memberof CardResponse
     */
    label?: string;
    /**
     * References for the card.
     * Up to 5 name-value pairs assigned to the card for tracking.
     * 
     * :::info
     * Each time the card is used, the references are recorded in the [transaction details](https://developer.revolut.com/docs/business/get-transaction#response) (`card.references`), helping track transactions made with this card.
     * :::
     * 
     * The names must be unique.
     * The references can be [amended](https://developer.revolut.com/docs/business/update-card-references) up to 10 times.
     * 
     * References are only supported for cards owned by the business (i.e. [company](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) or [auto-issued cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards)).
     * They are **not** supported for [team member cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (i.e. with `holder_id` present).
     * 
     * :::note
     * The references recorded on a transaction are those assigned to the card at the time the transaction took place.
     * If the references are amended, they will only be applied to future transactions.
     * Existing transaction are not affected.
     * :::
     * @type {Set<CardReference>}
     * @memberof CardResponse
     */
    references?: Set<CardReference>;
    /**
     * 
     * @type {CardState}
     * @memberof CardResponse
     */
    state: CardState;
    /**
     * Returned for locked cards (`state=locked`).
     * Indicates whether the card can be [unlocked](https://developer.revolut.com/docs/business/unlock-card) manually (via API or in-app).
     * If `true`, you'll still need the [necessary scope or permission](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#lock-or-unlock-cards) to unlock the card.
     * 
     * :::info
     * Cards can be locked for various reasons.
     * For example, a card can be locked by the user, due to spending period settings, or automatically by the system.
     * Only certain types of lock can be lifted manually.
     * :::
     * @type {boolean}
     * @memberof CardResponse
     */
    canBeUnlocked?: boolean;
    /**
     * 
     * @type {SpendProgram}
     * @memberof CardResponse
     */
    spendProgram?: SpendProgram;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CardResponse
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They specify the dates when the card becomes available or unavailable for spending, and define what happens after the end date.
     * @type {SpendingPeriodSchema}
     * @memberof CardResponse
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories that are available for card spending. If not specified, categories are not restricted.
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CardResponse
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CardResponse
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the card can be used, specified as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CardResponse
     */
    countries?: Array<string>;
    /**
     * The list of linked accounts.
     * @type {Array<string>}
     * @memberof CardResponse
     */
    accounts: Array<string>;
}



/**
 * The state that the card is in.
 * 
 * Possible values:
 * - `active`: The card is available for spending. 
 *   Newly created cards typically go into `active` unless subject to certain conditions, for example, spending period starting in the future.
 * - `frozen`: The card has been frozen and is temporarily unavailable for spending. 
 * - `locked`: The card is locked, typically due to an [admin lock](https://developer.revolut.com/docs/business/lock-card) or spending period settings, i.e. when its `spending_period.start_date` is in the future or `spending_period.end_date` is in the past.
 *   A locked card is unavailable for spending until it's [unlocked](https://developer.revolut.com/docs/business/unlock-card) and active.
 *   :::tip
 *   To see if the card can be unlocked, check the `can_be_unlocked` parameter.
 *   Note that you'll still need the [necessary scope or permission](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#lock-or-unlock-cards) to unlock it.
 *   :::
 * - `created`: The card has been created but is not yet active.
 *   Used only for a specific type of cards.
 * - `pending`: This status is currently not in use.
 * @export
 */
export const CardState = {
    Created: 'created',
    Pending: 'pending',
    Active: 'active',
    Frozen: 'frozen',
    Locked: 'locked'
} as const;
export type CardState = typeof CardState[keyof typeof CardState];

/**
 * The [accounting category](https://developer.revolut.com/docs/business/accounting-categories) of the expense split.
 * @export
 * @interface Category
 */
export interface Category {
    /**
     * The ID of the accounting category.
     * @type {string}
     * @memberof Category
     */
    id: string;
    /**
     * The name of the accounting category.
     * @type {string}
     * @memberof Category
     */
    name: string;
    /**
     * The code of the accounting category.
     * @type {string}
     * @memberof Category
     */
    code?: string;
}

/**
 * The party to which any transaction fees are charged if the resulting transaction route has associated fees. 
 * Some transactions with fees might not be possible with the specified option, in which case error `3287` is returned.
 * @export
 */
export const ChargeBearer = {
    Shared: 'shared',
    Debtor: 'debtor'
} as const;
export type ChargeBearer = typeof ChargeBearer[keyof typeof ChargeBearer];

/**
 * 
 * @export
 * @interface Counterparty
 */
export interface Counterparty {
    /**
     * The ID of the counterparty.
     * @type {string}
     * @memberof Counterparty
     */
    id: string;
    /**
     * The name of the counterparty.
     * @type {string}
     * @memberof Counterparty
     */
    name: string;
    /**
     * The [Revtag](https://help.revolut.com/help/transfers/internal-transfers/username-payments/revtags/) of the counterparty.
     * @type {string}
     * @memberof Counterparty
     */
    revtag?: string;
    /**
     * 
     * @type {ProfileType}
     * @memberof Counterparty
     */
    profileType?: ProfileType;
    /**
     * The counterparty's bank country, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof Counterparty
     */
    country?: string;
    /**
     * Indicates the state of the counterparty.
     * @type {string}
     * @memberof Counterparty
     */
    state: CounterpartyStateEnum;
    /**
     * The date and time the counterparty was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Counterparty
     */
    createdAt: string;
    /**
     * The date and time the counterparty was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Counterparty
     */
    updatedAt: string;
    /**
     * The list of public accounts associated with this counterparty.
     * @type {Array<CounterpartyAccount>}
     * @memberof Counterparty
     */
    accounts?: Array<CounterpartyAccount>;
    /**
     * The list of cards associated with this counterparty.
     * @type {Array<CounterpartyCard>}
     * @memberof Counterparty
     */
    cards?: Array<CounterpartyCard>;
}


/**
 * @export
 */
export const CounterpartyStateEnum = {
    Created: 'created',
    Draft: 'draft',
    Deleted: 'deleted'
} as const;
export type CounterpartyStateEnum = typeof CounterpartyStateEnum[keyof typeof CounterpartyStateEnum];

/**
 * 
 * @export
 * @interface CounterpartyAccount
 */
export interface CounterpartyAccount {
    /**
     * The ID of the counterparty's account.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    id: string;
    /**
     * The name of the counterparty.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    name?: string;
    /**
     * The country of the bank, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    bankCountry?: string;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    currency: string;
    /**
     * Indicates the type of account.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    type: CounterpartyAccountTypeEnum;
    /**
     * The bank account number of the counterparty.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    accountNo?: string;
    /**
     * The IBAN number of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    iban?: string;
    /**
     * The sort code of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    sortCode?: string;
    /**
     * The routing number of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    routingNumber?: string;
    /**
     * The BIC number of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    bic?: string;
    /**
     * The CLABE number of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    clabe?: string;
    /**
     * The IFSC number of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    ifsc?: string;
    /**
     * The BSB number of the counterparty's account if applicable.
     * @type {string}
     * @memberof CounterpartyAccount
     */
    bsbCode?: string;
    /**
     * Indicates the possibility of the recipient charges.
     * 
     * :::caution
     * This field is deprecated and should be disregarded.
     * It is returned for legacy purposes only.
     * :::
     * @type {string}
     * @memberof CounterpartyAccount
     * @deprecated
     */
    recipientCharges?: CounterpartyAccountRecipientChargesEnum;
}


/**
 * @export
 */
export const CounterpartyAccountTypeEnum = {
    Revolut: 'revolut',
    External: 'external'
} as const;
export type CounterpartyAccountTypeEnum = typeof CounterpartyAccountTypeEnum[keyof typeof CounterpartyAccountTypeEnum];

/**
 * @export
 */
export const CounterpartyAccountRecipientChargesEnum = {
    No: 'no',
    Expected: 'expected'
} as const;
export type CounterpartyAccountRecipientChargesEnum = typeof CounterpartyAccountRecipientChargesEnum[keyof typeof CounterpartyAccountRecipientChargesEnum];

/**
 * 
 * @export
 * @interface CounterpartyCard
 */
export interface CounterpartyCard {
    /**
     * The ID of the counterparty's card.
     * @type {string}
     * @memberof CounterpartyCard
     */
    id: string;
    /**
     * The name of the counterparty.
     * @type {string}
     * @memberof CounterpartyCard
     */
    name: string;
    /**
     * The last four digits of the card number.
     * @type {string}
     * @memberof CounterpartyCard
     */
    lastDigits: string;
    /**
     * The card brand.
     * @type {string}
     * @memberof CounterpartyCard
     */
    scheme: CounterpartyCardSchemeEnum;
    /**
     * The country of the card issuer, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof CounterpartyCard
     */
    country: string;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof CounterpartyCard
     */
    currency: string;
}


/**
 * @export
 */
export const CounterpartyCardSchemeEnum = {
    Visa: 'visa',
    Mastercard: 'mastercard'
} as const;
export type CounterpartyCardSchemeEnum = typeof CounterpartyCardSchemeEnum[keyof typeof CounterpartyCardSchemeEnum];

/**
 * 
 * @export
 * @interface CounterpartyError
 */
export interface CounterpartyError {
    /**
     * The error code.
     * @type {number}
     * @memberof CounterpartyError
     */
    code: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof CounterpartyError
     */
    message: string;
    /**
     * 
     * @type {CounterpartyErrorParams}
     * @memberof CounterpartyError
     */
    params?: CounterpartyErrorParams;
}
/**
 * Additional parameters related to the error.
 * @export
 * @interface CounterpartyErrorParams
 */
export interface CounterpartyErrorParams {
    /**
     * The ID of the Revolut counterparty (i.e. internal counterparty) that already exists.
     * @type {string}
     * @memberof CounterpartyErrorParams
     */
    counterpartyId?: string;
}
/**
 * The accounting category to create.
 * @export
 * @interface CreateAccountingCategoryRequest
 */
export interface CreateAccountingCategoryRequest {
    /**
     * The full name for the accounting category.
     * @type {string}
     * @memberof CreateAccountingCategoryRequest
     */
    name: string;
    /**
     * The code name for the accounting category.
     * @type {string}
     * @memberof CreateAccountingCategoryRequest
     */
    code: string;
    /**
     * The ID of the default [tax rate](https://developer.revolut.com/docs/business/get-tax-rate) that should be applied to items in this accounting category unless overridden for a specific item.
     * @type {string}
     * @memberof CreateAccountingCategoryRequest
     */
    defaultTaxRateId?: string;
}
/**
 * 
 * @export
 * @interface CreateCardInvitationRequest
 */
export interface CreateCardInvitationRequest {
    /**
     * A unique ID of the request that you provide.
     * 
     * There is no strict requirement on the format of this ID, but we suggest using v4 UUIDs.
     * 
     * :::caution
     * This ID is used to prevent duplicate card creation requests in case of a lost connection or client error, so make sure you use the same `request_id` for requests related to the same card invitation.
     * The deduplication is limited to 24 hours counting from the first request using a given ID.
     * :::
     * For more information, see the guides: [Manage card invitations - Idempotency](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-card-invitations#idempotency).
     * @type {string}
     * @memberof CreateCardInvitationRequest
     */
    requestId: string;
    /**
     * The period after which the card invitation expires if it hasn't been claimed or cancelled. 
     * Must be specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) duration format.
     * The duration is counted from the card invitation creation.
     * - **Minimum duration:** 1 day (`P1D`)
     * - **Maximum duration:** 90 days (`P90D`)
     * - **Default duration:** 90 days (`P90D`)
     * @type {string}
     * @memberof CreateCardInvitationRequest
     */
    expiryPeriod?: string;
    /**
     * The ID of the team member who will be assigned as the holder of the card after the invitation is claimed.
     * 
     * :::tip
     * To retrieve a team member's ID, use the [`GET /team-members` operation](https://developer.revolut.com/docs/business/get-team-members).
     * :::
     * @type {string}
     * @memberof CreateCardInvitationRequest
     */
    holderId: string;
    /**
     * Specifies the type of the card. 
     * Must be set to `true`, as with the API, you can create only virtual cards.
     * 
     * :::tip
     * To create physical cards, use the [Revolut Business app](https://business.revolut.com).
     * :::
     * @type {boolean}
     * @memberof CreateCardInvitationRequest
     */
    virtual: boolean;
    /**
     * The label for the card to be issued, displayed in the UI to help distinguish between cards.
     * If not specified, the default label will be set according to the card's type.
     * For card invitations created via API, it's always `Virtual`.
     * @type {string}
     * @memberof CreateCardInvitationRequest
     */
    label?: string;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CreateCardInvitationRequest
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They let you set the dates when the card becomes available or unavailable for spending, and define what happens after the end date.
     * 
     * If specified, you must provide at least one of these:
     * - `start_date`
     * - `end_date` together with `end_date_action`
     * 
     * The dates provided must be in the future.
     * @type {SpendingPeriodSchema}
     * @memberof CreateCardInvitationRequest
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories to be available for card spending.
     * If not specified, all categories will be allowed.
     * 
     * :::note
     * The `categories` and `merchant_controls` parameters have the following restrictions:
     * - If you set `categories`, you **cannot** set `merchant_controls.control_type` to `allow`.
     * - You **can** set `merchant_controls.control_type` to `block`.
     * - You may also set **either** `categories` or `merchant_controls` independently, or **set neither**.
     * - Both parameters can be used together **only** if `merchant_controls.control_type` is `block`.
     * :::
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CreateCardInvitationRequest
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CreateCardInvitationRequest
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * Restricts card use to specified countries, provided as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CreateCardInvitationRequest
     */
    countries?: Array<string>;
    /**
     * The list of accounts to link to the card.
     * If not specified, all accounts will be linked.
     * To retrieve account IDs, use the [`GET /accounts` operation](https://developer.revolut.com/docs/business/get-accounts).
     * @type {Array<string>}
     * @memberof CreateCardInvitationRequest
     */
    accounts?: Array<string>;
}
/**
 * 
 * @export
 * @interface CreateCardRequest
 */
export interface CreateCardRequest {
    /**
     * A unique ID of the request that you provide.
     * 
     * There is no strict requirement on the format of this ID, but we suggest using v4 UUIDs.
     * 
     * :::caution
     * This ID is used to prevent duplicate card creation requests in case of a lost connection or client error, so make sure you use the same `request_id` for requests related to the same card.
     * The deduplication is limited to 24 hours counting from the first request using a given ID.
     * For more information, see the guides: [Manage cards - Idempotency](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#idempotency).
     * :::
     * @type {string}
     * @memberof CreateCardRequest
     */
    requestId: string;
    /**
     * The ID of the team member to assign as the holder of the card.
     * 
     * :::tip
     * To retrieve a team member's ID, use the [`GET /team-members` operation](https://developer.revolut.com/docs/business/get-team-members).
     * :::
     * 
     * For virtual cards (`virtual=true`), this field is optional.                    
     * If not provided, the type of the issued card depends on `contact_ids`:
     *   - `contact_ids` provided → [company card](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards)
     *   - `contact_ids` not specified → [auto-issued card](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards)
     * @type {string}
     * @memberof CreateCardRequest
     */
    holderId?: string;
    /**
     * The list of [contacts](https://help.revolut.com/business/help/cards/more-on-cards/company-cards/) for the card.
     * Up to 5 team members sharing the card, much like co-holders.
     * Can be [edited](https://developer.revolut.com/docs/business/update-card-contacts).
     * 
     * Allowed only for [company cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (`virtual=true`, `holder_id` not specified).
     * @type {Array<string>}
     * @memberof CreateCardRequest
     */
    contactIds?: Array<string>;
    /**
     * 
     * @type {CreateCardRequestProduct}
     * @memberof CreateCardRequest
     */
    product?: CreateCardRequestProduct;
    /**
     * Specifies the type of the card. 
     * Must be set to `true`, as with the API, you can create only virtual cards.
     * 
     * :::tip
     * To create a physical card, use the [Revolut Business app](https://business.revolut.com).
     * :::
     * @type {boolean}
     * @memberof CreateCardRequest
     */
    virtual: boolean;
    /**
     * The label for the issued card, displayed in the UI to help distinguish between cards.
     * If not specified, no label will be added.
     * @type {string}
     * @memberof CreateCardRequest
     */
    label?: string;
    /**
     * References for the card.
     * Up to 5 name-value pairs assigned to the card for tracking.
     * 
     * :::info
     * Each time the card is used, the references are recorded in the [transaction details](https://developer.revolut.com/docs/business/get-transaction#response) (`card.references`), helping track transactions made with this card.
     * :::
     * 
     * The names must be unique.
     * The references can be [amended](https://developer.revolut.com/docs/business/update-card-references) up to 10 times.
     * 
     * References are only supported for cards owned by the business (i.e. [company](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) or [auto-issued cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards)).
     * They are **not** supported for [team member cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (i.e. with `holder_id` present).
     * 
     * :::note
     * The references recorded on a transaction are those assigned to the card at the time the transaction took place.
     * If the references are amended, they will only be applied to future transactions.
     * Existing transaction are not affected.
     * :::
     * @type {Set<CardReference>}
     * @memberof CreateCardRequest
     */
    references?: Set<CardReference>;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof CreateCardRequest
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They let you set the dates when the card becomes available or unavailable for spending, and define what happens after the end date.
     * 
     * If specified, you must provide at least one of these:
     * - `start_date`
     * - `end_date` together with `end_date_action`
     * 
     * The dates provided must be in the future.
     * @type {SpendingPeriodSchema}
     * @memberof CreateCardRequest
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories to be available for card spending.
     * If not specified, all categories will be allowed.
     * 
     * :::note
     * The `categories` and `merchant_controls` parameters have the following restrictions:
     * - If you set `categories`, you **cannot** set `merchant_controls.control_type` to `allow`.
     * - You **can** set `merchant_controls.control_type` to `block`.
     * - You may also set **either** `categories` or `merchant_controls` independently, or **set neither**.
     * - Both parameters can be used together **only** if `merchant_controls.control_type` is `block`.
     * :::
     * @type {Array<BusinessMerchantCategory>}
     * @memberof CreateCardRequest
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof CreateCardRequest
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * Restricts card use to specified countries, provided as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof CreateCardRequest
     */
    countries?: Array<string>;
    /**
     * The list of accounts to link to the card.
     * If not specified, all accounts will be linked.
     * To retrieve account IDs, use the [`GET /accounts` operation](https://developer.revolut.com/docs/business/get-accounts).
     * @type {Array<string>}
     * @memberof CreateCardRequest
     */
    accounts?: Array<string>;
}
/**
 * The card product offered by the card provider for this card.
 * In other words, the program that the card is issued under.
 * 
 * Provided only for virtual cards with no holder ID (`virtual=true`, and `holder_id` not specified):
 * - **Required** for [auto-issued cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (`contact_ids` not specified)
 * - Optional for [company cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (`contact_ids` specified)
 * 
 * Not allowed for [team member cards](https://developer.revolut.com/docs/guides/manage-accounts/cards/manage-cards#different-types-of-cards) (`holder_id` present).
 * 
 * :::note
 * This property is only available to travel intermediaries using our travel solution.
 * To use it, please contact [Revolut API Support](mailto:api-requests@revolut.com).
 * :::
 * @export
 * @interface CreateCardRequestProduct
 */
export interface CreateCardRequestProduct {
    /**
     * The code of the card product.
     * @type {string}
     * @memberof CreateCardRequestProduct
     */
    code: string;
}
/**
 * 
 * @export
 * @interface CreateCounterpartyRequest
 */
export interface CreateCounterpartyRequest {
    /**
     * The type of the Revolut profile.
     * Indicates whether the counterparty is a personal or business account.
     * Provide it when adding a Revolut counterparty via Revtag.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    profileType?: CreateCounterpartyRequestProfileTypeEnum;
    /**
     * The [Revtag](https://help.revolut.com/help/transfers/internal-transfers/username-payments/revtags/) of the counterparty to add.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    revtag?: string;
    /**
     * The name of the counterparty, provided when the counterparty is being added via **Revtag**.
     * 
     * If specified, `individual_name` and `company_name` must be empty.
     * 
     * :::note
     * The name that you provide must match or closely match the actual name associated with the account that you're trying to add.
     * Otherwise, the creation fails and a `404` error is returned.
     * :::
     * 
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    name?: string;
    /**
     * The name of the counterparty, provided when the counterparty is a **company** (business account type) and is **not** being added via Revtag.
     * 
     * If specified, `individual_name` and `name` must be empty.
     * 
     * :::caution
     * The `company_name` must contain at least 2 letters (not just characters).
     * For example, names like `12` will fail validation because they are two characters but not two letters.
     * :::
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    companyName?: string;
    /**
     * 
     * @type {IndividualName}
     * @memberof CreateCounterpartyRequest
     */
    individualName?: IndividualName;
    /**
     * The country of the bank, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    bankCountry?: string;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    currency?: string;
    /**
     * The bank account number of the counterparty.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    accountNo?: string;
    /**
     * The IBAN number of the counterparty's account. This field is displayed for IBAN countries.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    iban?: string;
    /**
     * The sort code of the counterparty's account. This field is required for GBP accounts.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    sortCode?: string;
    /**
     * The routing number of the counterparty's account. This field is required for USD accounts.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    routingNumber?: string;
    /**
     * The BIC number of the counterparty's account. This field is required for non-SEPA IBAN/SWIFT.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    bic?: string;
    /**
     * The CLABE number of the counterparty's account. This field is required for SWIFT MX.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    clabe?: string;
    /**
     * The IFSC number of the counterparty's account. This field is required for INR accounts.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    ifsc?: string;
    /**
     * The BSB number of the counterparty's account. This field is required for AUD accounts.
     * @type {string}
     * @memberof CreateCounterpartyRequest
     */
    bsbCode?: string;
    /**
     * 
     * @type {BeneficiaryAddress}
     * @memberof CreateCounterpartyRequest
     */
    address?: BeneficiaryAddress;
}


/**
 * @export
 */
export const CreateCounterpartyRequestProfileTypeEnum = {
    Personal: 'personal',
    Business: 'business'
} as const;
export type CreateCounterpartyRequestProfileTypeEnum = typeof CreateCounterpartyRequestProfileTypeEnum[keyof typeof CreateCounterpartyRequestProfileTypeEnum];

/**
 * 
 * @export
 * @interface CreateLabelGroupRequest
 */
export interface CreateLabelGroupRequest {
    /**
     * The name for the new label group.
     * @type {string}
     * @memberof CreateLabelGroupRequest
     */
    name: string;
    /**
     * The labels to create in the new group.
     * 
     * The maximum number of labels you can create for a new group is 200.
     * If you need to add more, you can add them later by [creating new labels individually](https://developer.revolut.com/docs/business/create-label).
     * @type {Array<CreateLabelRequest>}
     * @memberof CreateLabelGroupRequest
     */
    labels: Array<CreateLabelRequest>;
}
/**
 * 
 * @export
 * @interface CreateLabelRequest
 */
export interface CreateLabelRequest {
    /**
     * The name for the new label.
     * @type {string}
     * @memberof CreateLabelRequest
     */
    name: string;
}
/**
 * 
 * @export
 * @interface CreatePaymentDraftRequest
 */
export interface CreatePaymentDraftRequest {
    /**
     * The title of the payment draft.
     * @type {string}
     * @memberof CreatePaymentDraftRequest
     */
    title?: string;
    /**
     * The scheduled date of the payment draft in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof CreatePaymentDraftRequest
     */
    scheduleFor?: string;
    /**
     * The details of the payment(s) to be made.
     * @type {Array<PaymentRequest>}
     * @memberof CreatePaymentDraftRequest
     */
    payments: Array<PaymentRequest>;
}
/**
 * 
 * @export
 * @interface CreatePaymentDraftResponse
 */
export interface CreatePaymentDraftResponse {
    /**
     * The ID of the payment draft created.
     * @type {string}
     * @memberof CreatePaymentDraftResponse
     */
    id: string;
}
/**
 * 
 * @export
 * @interface CreatePayoutLinkRequest
 */
export interface CreatePayoutLinkRequest {
    /**
     * The name of the counterparty provided by the sender.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    counterpartyName: string;
    /**
     * Indicates whether to save the recipient as your counterparty upon link claim.
     * If `false` then the counterparty will not show up on your counterparties list, for example, when you retrieve your counterparties. 
     * However, you will still be able to retrieve this counterparty by its ID.
     * 
     * If you don't choose to save the counterparty on link creation, you can do it later from your transactions list in the Business app.
     * @type {boolean}
     * @memberof CreatePayoutLinkRequest
     */
    saveCounterparty?: boolean;
    /**
     * The ID of the request, provided by the sender.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    requestId: string;
    /**
     * The ID of the sender's account.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    accountId: string;
    /**
     * The amount of money to be transferred.
     * 
     * :::note
     * The amount must be between £1 and £2,500, or equivalent in the selected currency.
     * :::
     * @type {number}
     * @memberof CreatePayoutLinkRequest
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    currency: string;
    /**
     * The reference for the payout link.
     * A piece of text or number you provide to help identify what the payment relates to.
     * It can be used, for example, for reconciliation or tracking purposes.
     * 
     * You might include an invoice number, account or transaction ID, or any other reference meaningful to you or the recipient.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    reference: string;
    /**
     * The list of payout methods that the recipient can use to claim the payout, where:
     * - `revolut`: Revolut peer-to-peer (P2P) transfer
     * - `bank_account`: External bank transfer
     * - `card`: Card transfer
     *   :::note
     *   - This payout method is available in the UK and the EEA.
     *   - This payout method is not available in Sandbox.
     *   :::
     * @type {Array<PayoutMethod>}
     * @memberof CreatePayoutLinkRequest
     */
    payoutMethods?: Array<PayoutMethod>;
    /**
     * The period after which the payout link expires if not claimed before, provided in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * 
     * The default and maximum value is 7 days from the link creation.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    expiryPeriod?: string;
    /**
     * The reason code for the transaction. Transactions to certain countries and currencies might require you to provide a transfer reason. 
     * You can check available reason codes with the [`GET /transfer-reasons` operation](https://developer.revolut.com/docs/business/get-transfer-reasons).
     * 
     * If a transfer reason is not required for the given currency and country, this field is ignored.
     * @type {string}
     * @memberof CreatePayoutLinkRequest
     */
    transferReasonCode?: string;
}
/**
 * 
 * @export
 * @interface CreateTaxRateRequest
 */
export interface CreateTaxRateRequest {
    /**
     * The name of the tax.
     * @type {string}
     * @memberof CreateTaxRateRequest
     */
    name: string;
    /**
     * The tax rate percentage applied to the taxable amount. For example, `23` for 23%.
     * @type {number}
     * @memberof CreateTaxRateRequest
     */
    percentage: number;
}
/**
 * 
 * @export
 * @interface CreateWebhookRequest
 */
export interface CreateWebhookRequest {
    /**
     * A valid webhook URL to which to send event notifications. The supported protocol is `https`.
     * @type {string}
     * @memberof CreateWebhookRequest
     */
    url: string;
    /**
     * A list of event types to subscribe to.
     * If you don't provide it, you're automatically subscribed to the [default event types](https://developer.revolut.com/docs/guides/manage-accounts/webhooks/about-webhooks#default-event-types).
     * @type {Array<WebhookEventType>}
     * @memberof CreateWebhookRequest
     */
    events?: Array<WebhookEventType>;
}
/**
 * Unauthorised
 * 
 * Returned, for example, when the credentials you used to make the request are invalid.
 * For more information, see the **Authorization** section.
 * @export
 * @interface ErrorUnauthorized
 */
export interface ErrorUnauthorized {
    /**
     * The error code.
     * @type {number}
     * @memberof ErrorUnauthorized
     */
    status: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof ErrorUnauthorized
     */
    message: string;
}
/**
 * Unprocessable entity
 * 
 * Returned, for example, when you try to modify a resource which is not a in state that would allow for modifications, e.g. a card invitation in state `failed`.
 * @export
 * @interface ErrorUnprocessableEntity
 */
export interface ErrorUnprocessableEntity {
    /**
     * The error code.
     * @type {number}
     * @memberof ErrorUnprocessableEntity
     */
    code?: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof ErrorUnprocessableEntity
     */
    message: string;
}
/**
 * 
 * @export
 * @interface ErrorWithId
 */
export interface ErrorWithId {
    /**
     * The ID of the specific error instance. Used for traceability.
     * @type {string}
     * @memberof ErrorWithId
     */
    errorId: string;
    /**
     * The error code.
     * @type {number}
     * @memberof ErrorWithId
     */
    code: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof ErrorWithId
     */
    message: string;
}
/**
 * Error returning a status instead of code.
 * @export
 * @interface ErrorWithStatus
 */
export interface ErrorWithStatus {
    /**
     * The error code.
     * @type {number}
     * @memberof ErrorWithStatus
     */
    status: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof ErrorWithStatus
     */
    message: string;
}
/**
 * The estimated time of the inbound transfer of the funds, i.e. when we expect the recipient to receive the transfer.
 * @export
 * @interface EstimatedTime
 */
export interface EstimatedTime {
    /**
     * The estimated time unit of the inbound transfer of the funds.
     * @type {string}
     * @memberof EstimatedTime
     */
    unit: EstimatedTimeUnitEnum;
    /**
     * The minimum time estimate.
     * @type {number}
     * @memberof EstimatedTime
     */
    min?: number;
    /**
     * The maximum time estimate.
     * @type {number}
     * @memberof EstimatedTime
     */
    max?: number;
}


/**
 * @export
 */
export const EstimatedTimeUnitEnum = {
    Days: 'days',
    Hours: 'hours'
} as const;
export type EstimatedTimeUnitEnum = typeof EstimatedTimeUnitEnum[keyof typeof EstimatedTimeUnitEnum];

/**
 * The details of the currency to exchange from.
 * @export
 * @interface ExchangePartFrom
 */
export interface ExchangePartFrom {
    /**
     * The ID of the account to sell currency from.
     * @type {string}
     * @memberof ExchangePartFrom
     */
    accountId: string;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof ExchangePartFrom
     */
    currency: string;
    /**
     * The amount of currency.
     * Specify **only** if you want to sell currency.
     * @type {number}
     * @memberof ExchangePartFrom
     */
    amount?: number;
}
/**
 * The details of the currency to exchange to.
 * @export
 * @interface ExchangePartTo
 */
export interface ExchangePartTo {
    /**
     * The ID of the account to receive exchanged currency into.
     * @type {string}
     * @memberof ExchangePartTo
     */
    accountId: string;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof ExchangePartTo
     */
    currency: string;
    /**
     * The amount of currency.
     * Specify **only** if you want to buy currency.
     * @type {number}
     * @memberof ExchangePartTo
     */
    amount?: number;
}
/**
 * 
 * @export
 * @interface ExchangeRateResponse
 */
export interface ExchangeRateResponse {
    /**
     * 
     * @type {AmountWithCurrency}
     * @memberof ExchangeRateResponse
     */
    from: AmountWithCurrency;
    /**
     * 
     * @type {AmountWithCurrency}
     * @memberof ExchangeRateResponse
     */
    to: AmountWithCurrency;
    /**
     * The proposed exchange rate.
     * @type {number}
     * @memberof ExchangeRateResponse
     */
    rate: number;
    /**
     * 
     * @type {Fee}
     * @memberof ExchangeRateResponse
     */
    fee: Fee;
    /**
     * The date of the proposed exchange rate in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof ExchangeRateResponse
     */
    rateDate: string;
}
/**
 * 
 * @export
 * @interface ExchangeReason
 */
export interface ExchangeReason {
    /**
     * Category code of the reason for the exchange.
     * @type {string}
     * @memberof ExchangeReason
     */
    code: ExchangeReasonCodeEnum;
    /**
     * Category name of the reason for the exchange.
     * @type {string}
     * @memberof ExchangeReason
     */
    name: string;
}


/**
 * @export
 */
export const ExchangeReasonCodeEnum = {
    BusinessExpenseAndClaims: 'business_expense_and_claims',
    FeesAndCharges: 'fees_and_charges',
    FundTransferAndIntracompanyPayment: 'fund_transfer_and_intracompany_payment',
    GiftsAndDonations: 'gifts_and_donations',
    GovernmentServicesAndTax: 'government_services_and_tax',
    Insurance: 'insurance',
    Inventory: 'inventory',
    InvestmentDividendAndInterest: 'investment_dividend_and_interest',
    LoanAndLoanRepayment: 'loan_and_loan_repayment',
    Marketing: 'marketing',
    PaymentForGoodsAndServices: 'payment_for_goods_and_services',
    Payroll: 'payroll',
    Refund: 'refund',
    RentalAndProperty: 'rental_and_property',
    Sales: 'sales',
    ServiceProviderAndSoftware: 'service_provider_and_software',
    TravelAndTransportation: 'travel_and_transportation',
    Utilities: 'utilities'
} as const;
export type ExchangeReasonCodeEnum = typeof ExchangeReasonCodeEnum[keyof typeof ExchangeReasonCodeEnum];

/**
 * The exchange information.
 * @export
 * @interface ExchangeRequest
 */
export interface ExchangeRequest {
    /**
     * 
     * @type {ExchangePartFrom}
     * @memberof ExchangeRequest
     */
    from: ExchangePartFrom;
    /**
     * 
     * @type {ExchangePartTo}
     * @memberof ExchangeRequest
     */
    to: ExchangePartTo;
    /**
     * The reference for the exchange transaction, provided by you.
     * It helps you to identify the transaction if you want to look it up later.
     * @type {string}
     * @memberof ExchangeRequest
     */
    reference?: string;
    /**
     * The ID of the request, provided by you.
     * It helps you identify the transaction in your system.
     * 
     * :::caution
     * To ensure that an exchange transaction is not processed multiple times if there are network or system errors,
     * the same `request_id` should be used for requests related to the same transaction.
     * :::
     * @type {string}
     * @memberof ExchangeRequest
     */
    requestId: string;
    /**
     * The reason code for the exchange.
     * Depending on the country and the amount of funds to be exchanged, you might be required to provide an exchange reason. 
     * You can check available reason codes with the [`GET /exchange-reasons` operation](https://developer.revolut.com/docs/business/get-exchange-reasons).
     * 
     * If an exchange reason is not required, this field is ignored.
     * @type {string}
     * @memberof ExchangeRequest
     */
    exchangeReasonCode?: string;
}
/**
 * 
 * @export
 * @interface ExchangeResponse
 */
export interface ExchangeResponse {
    /**
     * The ID of the created transaction.
     * @type {string}
     * @memberof ExchangeResponse
     */
    id?: string;
    /**
     * The type of the transaction. For money exchange, it is `exchange`.
     * @type {string}
     * @memberof ExchangeResponse
     */
    type?: string;
    /**
     * The reason why the transaction was failed or declined.
     * 
     * Present only when the `state` parameter of the transaction is `declined` or `failed`.
     * @type {string}
     * @memberof ExchangeResponse
     */
    reasonCode?: string;
    /**
     * The date and time the transaction was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof ExchangeResponse
     */
    createdAt?: string;
    /**
     * The date and time the transaction was completed in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof ExchangeResponse
     */
    completedAt?: string;
    /**
     * 
     * @type {TransactionState}
     * @memberof ExchangeResponse
     */
    state?: TransactionState;
}


/**
 * 
 * @export
 * @interface Expense
 */
export interface Expense {
    /**
     * The ID of the expense.
     * @type {string}
     * @memberof Expense
     */
    id: string;
    /**
     * 
     * @type {ExpenseState}
     * @memberof Expense
     */
    state: ExpenseState;
    /**
     * 
     * @type {ExpenseTransactionType}
     * @memberof Expense
     */
    transactionType: ExpenseTransactionType;
    /**
     * The description of the expense.
     * @type {string}
     * @memberof Expense
     */
    description?: string;
    /**
     * The date and time the expense was submitted in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Expense
     */
    submittedAt?: string;
    /**
     * The date and time the expense was completed in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Expense
     */
    completedAt?: string;
    /**
     * The name of the [team member](https://developer.revolut.com/docs/business/team-members) who made the transaction, refund request, or ATM withdrawal, or the name of the business if the related transaction is of type `fee`.
     * @type {string}
     * @memberof Expense
     */
    payer?: string;
    /**
     * The name of the merchant.
     * @type {string}
     * @memberof Expense
     */
    merchant?: string;
    /**
     * The ID of the [transaction](https://developer.revolut.com/docs/business/get-transaction) related to the expense. Not available for transactions of type `external`.
     * @type {string}
     * @memberof Expense
     */
    transactionId?: string;
    /**
     * The expense data depends on the type of the expense and whether it has been completed.
     * 
     * Typically, it's the date and time of the expense [transaction](https://developer.revolut.com/docs/business/get-transaction) in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * - If the transaction related to the expense is completed, it is the date and time of its completion ([`completed_at`](https://developer.revolut.com/docs/business/get-transaction#response)).
     * - Otherwise, it is the date and time of its creation ([`created_at`](https://developer.revolut.com/docs/business/get-transaction#response)).
     * 
     * For reimbursements, it's the payment date provided in the reimbursement request.
     * @type {string}
     * @memberof Expense
     */
    expenseDate: string;
    /**
     * The [labels](https://developer.revolut.com/docs/business/labels) added to the expense, organised in groups.
     * 
     * You can have up to 5 label groups, with max. 1 label per group.
     * 
     * The labels are provided as an object, where each key is the name of a label group, and each value is a single-element array containing the selected label from that group.
     * @type {{ [key: string]: Array<string>; }}
     * @memberof Expense
     */
    labels: { [key: string]: Array<string>; };
    /**
     * The splits of the expense.
     * 
     * A single expense can be divided into multiple parts (splits), for example, to allocate different portions of the expense to different categories.
     * @type {Array<ExpenseSplit>}
     * @memberof Expense
     */
    splits: Array<ExpenseSplit>;
    /**
     * The IDs of the receipts related to the expense.
     * @type {Array<string>}
     * @memberof Expense
     */
    receiptIds: Array<string>;
    /**
     * 
     * @type {ExpenseSpentAmount}
     * @memberof Expense
     */
    spentAmount: ExpenseSpentAmount;
}


/**
 * The expense amount in billed currency.
 * @export
 * @interface ExpenseSpentAmount
 */
export interface ExpenseSpentAmount {
    /**
     * The amount of money.
     * @type {number}
     * @memberof ExpenseSpentAmount
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof ExpenseSpentAmount
     */
    currency: string;
}
/**
 * 
 * @export
 * @interface ExpenseSplit
 */
export interface ExpenseSplit {
    /**
     * 
     * @type {ExpenseSplitAmount}
     * @memberof ExpenseSplit
     */
    amount: ExpenseSplitAmount;
    /**
     * 
     * @type {Category}
     * @memberof ExpenseSplit
     */
    category: Category;
    /**
     * 
     * @type {TaxRate}
     * @memberof ExpenseSplit
     */
    taxRate: TaxRate;
}
/**
 * The original amount of the expense split.
 * @export
 * @interface ExpenseSplitAmount
 */
export interface ExpenseSplitAmount {
    /**
     * The amount of money.
     * @type {number}
     * @memberof ExpenseSplitAmount
     */
    amount?: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof ExpenseSplitAmount
     */
    currency?: string;
}

/**
 * Indicates the state of the expense. Possible values:
 * 
 *   - `missing_info`: The expense is missing some required information.
 * 
 *     This is the initial state of the expense when it's first created.
 *     Once the missing information is provided, the expense is ready to be submitted.
 * 
 *   - `awaiting_review`: The expense is awaiting approval before it can be completed.
 * 
 *     The approver can approve, reject, or request repayment for the expense.
 *     It is also possible for the submitter to undo the submission at this stage.
 * 
 *   - `rejected`: The expense has been rejected by the approver. 
 * 
 *     The expense submitter (typically, the payer) should fix the issue that was the reason for the rejection and resubmit the expense.
 * 
 *   - `pending_reimbursement`: The reimbursement request has been approved, and the expense is awaiting reimbursement.
 * 
 *     This state is possible for reimbursements (transaction type = `External`). 
 * 
 *   - `refund_requested`: The expense has been rejected and repayment has been requested.*
 * 
 *     This state is possible for card transactions.
 *     It indicates that following the review, the approver rejected the expense and requested that it be paid back to the business account.
 *     This can happen, for example, if an employee accidentally makes a personal purchase with their business card.
 *     Once the money has been returned, the **admin** can mark this expense as repaid.
 * 
 *   - `refunded`: The expense has been repaid.*
 * 
 *     This state indicates that the admin has marked the expense as repaid.
 * 
 *   - `approved`: The expense has been approved and is now completed.*
 * 
 *   - `reverted`: The expense has been reverted. 
 * 
 *     This status indicates that the transaction related to the expense has been reverted.
 *     In such a case, the expense status is automatically set to `reverted`, and the expense is completed.
 *     This can happen, for example, when the transaction has been reverted by the merchant.
 * 
 * _*Additionally, if an admin has previously approved the expense, marked it as repaid/completed, or requested repayment, they can revert their decision.
 * In such a case, the expense goes back to the initial `missing_info` state._
 * 
 * For more information, see the guides: [Retrieve expenses and receipts](https://developer.revolut.com/docs/guides/manage-accounts/accounts-and-transactions/retrieve-expenses#expense-state).
 * @export
 */
export const ExpenseState = {
    MissingInfo: 'missing_info',
    AwaitingReview: 'awaiting_review',
    Rejected: 'rejected',
    PendingReimbursement: 'pending_reimbursement',
    RefundRequested: 'refund_requested',
    Refunded: 'refunded',
    Approved: 'approved',
    Reverted: 'reverted'
} as const;
export type ExpenseState = typeof ExpenseState[keyof typeof ExpenseState];


/**
 * The type of the [transaction](https://developer.revolut.com/docs/business/get-transaction) related to the expense.
 * @export
 */
export const ExpenseTransactionType = {
    Atm: 'atm',
    CardPayment: 'card_payment',
    Fee: 'fee',
    Transfer: 'transfer',
    External: 'external',
    MileageReimbursement: 'mileage_reimbursement'
} as const;
export type ExpenseTransactionType = typeof ExpenseTransactionType[keyof typeof ExpenseTransactionType];

/**
 * 
 * @export
 * @interface Fee
 */
export interface Fee {
    /**
     * The fee amount.
     * @type {number}
     * @memberof Fee
     */
    amount?: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof Fee
     */
    currency?: string;
}
/**
 * 
 * @export
 * @interface GetAccountingCategories200Response
 */
export interface GetAccountingCategories200Response {
    /**
     * Cursor for the next page. 
     * Used for pagination when the total number of results exceeds the maximum number per page.
     * 
     * To get the next page of results, make a new request and set `page_token` to the `next_page_token` value returned in the previous response.
     * :::note
     * If there are no more results to fetch, `next_page_token` is not returned in the response.
     * :::
     * @type {string}
     * @memberof GetAccountingCategories200Response
     */
    nextPageToken?: string;
    /**
     * The list of accounting categories.
     * @type {Array<AccountingCategoryResponse>}
     * @memberof GetAccountingCategories200Response
     */
    accountingCategories: Array<AccountingCategoryResponse>;
}
/**
 * 
 * @export
 * @interface GetLabelGroups200Response
 */
export interface GetLabelGroups200Response {
    /**
     * Cursor for the next page. 
     * Used for pagination when the total number of results exceeds the maximum number per page.
     * 
     * To get the next page of results, make a new request and set `page_token` to the `next_page_token` value returned in the previous response.
     * :::note
     * If there are no more results to fetch, `next_page_token` is not returned in the response.
     * :::
     * @type {string}
     * @memberof GetLabelGroups200Response
     */
    nextPageToken?: string;
    /**
     * List of label groups.
     * @type {Array<LabelGroupResponse>}
     * @memberof GetLabelGroups200Response
     */
    labelGroups: Array<LabelGroupResponse>;
}
/**
 * 
 * @export
 * @interface GetLabels200Response
 */
export interface GetLabels200Response {
    /**
     * Cursor for the next page. 
     * Used for pagination when the total number of results exceeds the maximum number per page.
     * 
     * To get the next page of results, make a new request and set `page_token` to the `next_page_token` value returned in the previous response.
     * :::note
     * If there are no more results to fetch, `next_page_token` is not returned in the response.
     * :::
     * @type {string}
     * @memberof GetLabels200Response
     */
    nextPageToken?: string;
    /**
     * List of labels in the specified group
     * @type {Array<LabelResponse>}
     * @memberof GetLabels200Response
     */
    labels: Array<LabelResponse>;
}
/**
 * 
 * @export
 * @interface GetSensitiveCardDetails200Response
 */
export interface GetSensitiveCardDetails200Response {
    /**
     * The PAN (Primary Account Number) of the card.
     * @type {string}
     * @memberof GetSensitiveCardDetails200Response
     */
    pan: string;
    /**
     * The CVV (Card Verification Value) of the card.
     * @type {string}
     * @memberof GetSensitiveCardDetails200Response
     */
    cvv: string;
    /**
     * The card expiration date.
     * @type {string}
     * @memberof GetSensitiveCardDetails200Response
     */
    expiry: string;
}
/**
 * 
 * @export
 * @interface GetTaxRates200Response
 */
export interface GetTaxRates200Response {
    /**
     * Cursor for the next page. 
     * Used for pagination when the total number of results exceeds the maximum number per page.
     * 
     * To get the next page of results, make a new request and set `page_token` to the `next_page_token` value returned in the previous response.
     * :::note
     * If there are no more results to fetch, `next_page_token` is not returned in the response.
     * :::
     * @type {string}
     * @memberof GetTaxRates200Response
     */
    nextPageToken?: string;
    /**
     * 
     * @type {Array<TaxRateResponse>}
     * @memberof GetTaxRates200Response
     */
    taxRates: Array<TaxRateResponse>;
}
/**
 * The name of the counterparty, provided when the counterparty is an **individual** (personal account type) and is **not** being added via Revtag.
 * 
 * If specified, `company_name` and `name` must be empty.
 * @export
 * @interface IndividualName
 */
export interface IndividualName {
    /**
     * The first name of the individual counterparty.
     * @type {string}
     * @memberof IndividualName
     */
    firstName?: string;
    /**
     * The last name of the individual counterparty.
     * @type {string}
     * @memberof IndividualName
     */
    lastName?: string;
}
/**
 * 
 * @export
 * @interface InviteTeamMember201Response
 */
export interface InviteTeamMember201Response {
    /**
     * The email address of the invited member.
     * @type {string}
     * @memberof InviteTeamMember201Response
     */
    email: string;
    /**
     * The ID of the invited member.
     * @type {string}
     * @memberof InviteTeamMember201Response
     */
    id: string;
    /**
     * The ID of the [role](https://developer.revolut.com/docs/business/get-roles) assigned to the member.
     * @type {string}
     * @memberof InviteTeamMember201Response
     */
    roleId: string;
    /**
     * The date and time when the member was created.
     * @type {string}
     * @memberof InviteTeamMember201Response
     */
    createdAt: string;
    /**
     * The date and time when the member was last updated.
     * @type {string}
     * @memberof InviteTeamMember201Response
     */
    updatedAt: string;
}
/**
 * 
 * @export
 * @interface InviteTeamMemberRequest
 */
export interface InviteTeamMemberRequest {
    /**
     * The email address of the invited member.
     * @type {string}
     * @memberof InviteTeamMemberRequest
     */
    email: string;
    /**
     * The ID of the [role](https://developer.revolut.com/docs/business/get-roles) to assign to the new member.
     * @type {string}
     * @memberof InviteTeamMemberRequest
     */
    roleId: string;
}
/**
 * 
 * @export
 * @interface LabelGroupResponse
 */
export interface LabelGroupResponse {
    /**
     * The unique ID of the label group.
     * @type {string}
     * @memberof LabelGroupResponse
     */
    readonly id: string;
    /**
     * The name of the label group.
     * @type {string}
     * @memberof LabelGroupResponse
     */
    name: string;
    /**
     * The date and time the label group was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof LabelGroupResponse
     */
    readonly createdAt: string;
    /**
     * The date and time the label group was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof LabelGroupResponse
     */
    readonly updatedAt: string;
}
/**
 * 
 * @export
 * @interface LabelResponse
 */
export interface LabelResponse {
    /**
     * The unique ID of the label.
     * @type {string}
     * @memberof LabelResponse
     */
    readonly id: string;
    /**
     * The name of the label.
     * @type {string}
     * @memberof LabelResponse
     */
    name: string;
    /**
     * The date and time the label was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof LabelResponse
     */
    readonly createdAt: string;
    /**
     * The date and time the label was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof LabelResponse
     */
    readonly updatedAt: string;
}
/**
 * 
 * @export
 * @interface MerchantControlsSchema
 */
export interface MerchantControlsSchema {
    /**
     * The type of control to apply.
     * @type {string}
     * @memberof MerchantControlsSchema
     */
    controlType: MerchantControlsSchemaControlTypeEnum;
    /**
     * The list of IDs of merchants to which the control applies.
     * 
     * :::tip
     * To find merchant IDs, check transaction details (→ `merchant.id`).
     * You can fetch transaction details for a [specific transaction](https://developer.revolut.com/docs/business/get-transaction#response) or for [all transactions](https://developer.revolut.com/docs/business/get-transactions#response).
     * :::
     * @type {Array<string>}
     * @memberof MerchantControlsSchema
     */
    merchantIds: Array<string>;
}


/**
 * @export
 */
export const MerchantControlsSchemaControlTypeEnum = {
    Block: 'block',
    Allow: 'allow'
} as const;
export type MerchantControlsSchemaControlTypeEnum = typeof MerchantControlsSchemaControlTypeEnum[keyof typeof MerchantControlsSchemaControlTypeEnum];

/**
 * 
 * @export
 * @interface ModelError
 */
export interface ModelError {
    /**
     * The error code.
     * @type {number}
     * @memberof ModelError
     */
    code: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof ModelError
     */
    message: string;
}
/**
 * 
 * @export
 * @interface PaymentDraftResponse
 */
export interface PaymentDraftResponse {
    /**
     * The scheduled date of the payment draft in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof PaymentDraftResponse
     */
    scheduledFor?: string;
    /**
     * The title of the payment draft.
     * @type {string}
     * @memberof PaymentDraftResponse
     */
    title?: string;
    /**
     * The list of payments in the bulk.
     * @type {Array<PaymentInfo>}
     * @memberof PaymentDraftResponse
     */
    payments: Array<PaymentInfo>;
}
/**
 * 
 * @export
 * @interface PaymentDraftsResponse
 */
export interface PaymentDraftsResponse {
    /**
     * The list of payment drafts that haven't been sent for processing.
     * @type {Array<PaymentOrderInfo>}
     * @memberof PaymentDraftsResponse
     */
    paymentOrders: Array<PaymentOrderInfo>;
}
/**
 * The details of the payment draft.
 * @export
 * @interface PaymentInfo
 */
export interface PaymentInfo {
    /**
     * The ID of the payment.
     * 
     * Do not confuse it with the [payment draft ID](https://developer.revolut.com/docs/business/get-payment-drafts#response) or [transaction ID](https://developer.revolut.com/docs/business/get-transaction).
     * @type {string}
     * @memberof PaymentInfo
     */
    id: string;
    /**
     * 
     * @type {AmountWithCurrency}
     * @memberof PaymentInfo
     */
    amount: AmountWithCurrency;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof PaymentInfo
     */
    currency?: string;
    /**
     * The ID of the account to pay from.
     * @type {string}
     * @memberof PaymentInfo
     */
    accountId: string;
    /**
     * 
     * @type {PaymentReceiver}
     * @memberof PaymentInfo
     */
    receiver: PaymentReceiver;
    /**
     * 
     * @type {PaymentState}
     * @memberof PaymentInfo
     */
    state: PaymentState;
    /**
     * The reason for the current state.
     * @type {string}
     * @memberof PaymentInfo
     */
    reason?: string;
    /**
     * The description of the error message.
     * @type {string}
     * @memberof PaymentInfo
     */
    errorMessage?: string;
    /**
     * 
     * @type {PaymentInfoCurrentChargeOptions}
     * @memberof PaymentInfo
     */
    currentChargeOptions: PaymentInfoCurrentChargeOptions;
    /**
     * The description of the transaction.
     * @type {string}
     * @memberof PaymentInfo
     */
    reference?: string;
}


/**
 * The explanation of conversion process.
 * @export
 * @interface PaymentInfoCurrentChargeOptions
 */
export interface PaymentInfoCurrentChargeOptions {
    /**
     * 
     * @type {AmountWithCurrency}
     * @memberof PaymentInfoCurrentChargeOptions
     */
    from: AmountWithCurrency;
    /**
     * 
     * @type {AmountWithCurrency}
     * @memberof PaymentInfoCurrentChargeOptions
     */
    to: AmountWithCurrency;
    /**
     * 
     * @type {string}
     * @memberof PaymentInfoCurrentChargeOptions
     */
    rate?: string;
    /**
     * 
     * @type {AmountWithCurrency}
     * @memberof PaymentInfoCurrentChargeOptions
     */
    fee?: AmountWithCurrency;
}
/**
 * A list of payments.
 * @export
 * @interface PaymentOrderInfo
 */
export interface PaymentOrderInfo {
    /**
     * The ID of the payment draft.
     * @type {string}
     * @memberof PaymentOrderInfo
     */
    id: string;
    /**
     * The scheduled date of the payment draft in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof PaymentOrderInfo
     */
    scheduledFor?: string;
    /**
     * The title of the payment draft.
     * @type {string}
     * @memberof PaymentOrderInfo
     */
    title?: string;
    /**
     * The number of payments in the payment draft.
     * @type {number}
     * @memberof PaymentOrderInfo
     */
    paymentsCount: number;
}
/**
 * The details of the transfer recipient.
 * 
 * If the counterparty has multiple payment methods available (e.g. 2 accounts, or 1 account and 1 card), you must specify the account (`account_id`) or card (`card_id`) to which you want to transfer the money.
 * @export
 * @interface PaymentReceiver
 */
export interface PaymentReceiver {
    /**
     * The ID of the receiving counterparty.
     * @type {string}
     * @memberof PaymentReceiver
     */
    counterpartyId: string;
    /**
     * The ID of the receiving counterparty's account. Used for bank transfers.
     * 
     * If the counterparty has multiple payment methods available, use it to specify the account to which you want to send the money.
     * @type {string}
     * @memberof PaymentReceiver
     */
    accountId?: string;
    /**
     * The ID of the receiving counterparty's card.
     * Used for card transfers.
     * 
     * If the counterparty has multiple payment methods available, use it to specify the card to which you want to send the money.
     * @type {string}
     * @memberof PaymentReceiver
     */
    cardId?: string;
}
/**
 * The details of the draft payment.
 * @export
 * @interface PaymentRequest
 */
export interface PaymentRequest {
    /**
     * The ID of the account to pay from. 
     * 
     * :::note
     * You can specify only one account ID for multiple payments in the same payment draft.
     * :::
     * @type {string}
     * @memberof PaymentRequest
     */
    accountId: string;
    /**
     * 
     * @type {PaymentReceiver}
     * @memberof PaymentRequest
     */
    receiver: PaymentReceiver;
    /**
     * The amount of the payment.
     * @type {number}
     * @memberof PaymentRequest
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof PaymentRequest
     */
    currency: string;
    /**
     * The reference for the payment.
     * A piece of text or number you provide to help identify what the payment relates to.
     * It can be used, for example, for reconciliation or tracking purposes.
     * 
     * You might include an invoice number, account or transaction ID, or any other reference meaningful to you.
     * @type {string}
     * @memberof PaymentRequest
     */
    reference: string;
    /**
     * The party that should bear the transaction fees related to the selected transaction route if applied.
     * Possible options are: 
     * - `shared`: Also known as **SHA**. The transaction route fees are split between the sender and the recipient. 
     *   The sender pays the fees charged by their bank, while the recipient pays the fees charged by the receiving and any intermediary banks.
     * - `debtor`: Also known as **OUR**. The sender pays all explicit transaction fees.
     * 
     * :::note
     * - This field is not supported for [bulk payments](https://developer.revolut.com/docs/guides/manage-accounts/transfers/payment-drafts#use-cases). 
     * - Some transactions with fees might not support charge bearer selection.
     *   If this is the case, the request will return error `3287`.
     *   To proceed with the default fee handling, remove this field from your request and try again.
     * :::
     * @type {string}
     * @memberof PaymentRequest
     */
    chargeBearer?: PaymentRequestChargeBearerEnum;
}


/**
 * @export
 */
export const PaymentRequestChargeBearerEnum = {
    Shared: 'shared',
    Debtor: 'debtor'
} as const;
export type PaymentRequestChargeBearerEnum = typeof PaymentRequestChargeBearerEnum[keyof typeof PaymentRequestChargeBearerEnum];


/**
 * Indicates the state of the transaction.
 * @export
 */
export const PaymentState = {
    Created: 'CREATED',
    Pending: 'PENDING',
    Completed: 'COMPLETED',
    Reverted: 'REVERTED',
    Declined: 'DECLINED',
    Cancelled: 'CANCELLED',
    Failed: 'FAILED',
    Deleted: 'DELETED'
} as const;
export type PaymentState = typeof PaymentState[keyof typeof PaymentState];


/**
 * Indicates the payment scheme used to execute transactions.
 * @export
 */
export const PaymentSystem = {
    Chaps: 'chaps',
    Bacs: 'bacs',
    FasterPayments: 'faster_payments',
    Sepa: 'sepa',
    Swift: 'swift',
    Ach: 'ach',
    Elixir: 'elixir',
    Sorbnet: 'sorbnet',
    Nics: 'nics',
    Rix: 'rix',
    Sumclearing: 'sumclearing'
} as const;
export type PaymentSystem = typeof PaymentSystem[keyof typeof PaymentSystem];

/**
 * 
 * @export
 * @interface PayoutLink
 */
export interface PayoutLink {
    /**
     * The ID of the payout link.
     * @type {string}
     * @memberof PayoutLink
     */
    id: string;
    /**
     * 
     * @type {PayoutLinkState}
     * @memberof PayoutLink
     */
    state: PayoutLinkState;
    /**
     * The date and time the payout link was created in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * @type {string}
     * @memberof PayoutLink
     */
    createdAt: string;
    /**
     * The date and time the payout link was last updated in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * @type {string}
     * @memberof PayoutLink
     */
    updatedAt: string;
    /**
     * The name of the counterparty provided by the sender.
     * @type {string}
     * @memberof PayoutLink
     */
    counterpartyName: string;
    /**
     * Indicates whether you chose to save the recipient as your counterparty upon link claim. 
     * If `false` then the counterparty will not show up on your counterparties list, for example, when you [retrieve your counterparties](https://developer.revolut.com/docs/business/get-counterparties). 
     * However, you can still [retrieve this counterparty by its ID](https://developer.revolut.com/docs/business/get-counterparty).
     * 
     * If you didn't choose to save the counterparty on link creation, you can still do it from your transactions list in the Business app.
     * @type {boolean}
     * @memberof PayoutLink
     */
    saveCounterparty: boolean;
    /**
     * The ID of the request, provided by the sender.
     * @type {string}
     * @memberof PayoutLink
     */
    requestId: string;
    /**
     * The date and time after which the payout link expires in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * If the recipient doesn't claim the money before then, the payout link expires and is no longer available.
     * 
     * The default and maximum value is the date and time of creating the link + 7 days.
     * @type {string}
     * @memberof PayoutLink
     */
    expiryDate?: string;
    /**
     * The list of payout methods that the recipient can use to claim the payout, where:
     * - `revolut`: Revolut peer-to-peer (P2P) transfer
     * - `bank_account`: External bank transfer
     * - `card`: Card transfer
     *   :::note
     *   - This payout method is available in the UK and the EEA.
     *   - This payout method is not available in Sandbox.
     *   :::
     * @type {Array<PayoutMethod>}
     * @memberof PayoutLink
     */
    payoutMethods: Array<PayoutMethod>;
    /**
     * The ID of the sender's account.
     * @type {string}
     * @memberof PayoutLink
     */
    accountId: string;
    /**
     * The amount of money to be transferred.
     * 
     * :::note
     * The amount must be between £1 and £2,500, or equivalent in the selected currency.
     * :::
     * @type {number}
     * @memberof PayoutLink
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof PayoutLink
     */
    currency: string;
    /**
     * The URL of the payout link. Returned only for active payout links.
     * @type {string}
     * @memberof PayoutLink
     */
    url?: string;
    /**
     * The reference for the payout transaction, provided by the sender.
     * @type {string}
     * @memberof PayoutLink
     */
    reference: string;
    /**
     * The reason code for the transaction. Transactions to certain countries and currencies might require you to provide a transfer reason. 
     * You can check available reason codes with the [`GET /transfer-reasons` operation](https://developer.revolut.com/docs/business/get-transfer-reasons).
     * 
     * If a transfer reason is not required for the given currency and country, this field is ignored.
     * @type {string}
     * @memberof PayoutLink
     */
    transferReasonCode?: string;
    /**
     * The ID of the counterparty created based on the recipient's details. 
     * 
     * :::note
     * By default, the newly created counterparty is hidden from your counterparties list. 
     * 
     * To automatically save it when the link is claimed, pass the `save_counterparty` parameter set to `true`. 
     * 
     * Alternatively, you can add the recipient to your counterparties later from the list of transactions in the Business app.
     * :::
     * @type {string}
     * @memberof PayoutLink
     */
    counterpartyId?: string;
    /**
     * The ID of the created transaction. Returned only if the payout has been claimed.
     * @type {string}
     * @memberof PayoutLink
     */
    transactionId?: string;
    /**
     * The reason for which the payout link was cancelled.
     * @type {string}
     * @memberof PayoutLink
     */
    readonly cancellationReason?: PayoutLinkCancellationReasonEnum;
}


/**
 * @export
 */
export const PayoutLinkCancellationReasonEnum = {
    TooManyNameCheckAttempts: 'too_many_name_check_attempts'
} as const;
export type PayoutLinkCancellationReasonEnum = typeof PayoutLinkCancellationReasonEnum[keyof typeof PayoutLinkCancellationReasonEnum];

/**
 * 
 * @export
 * @interface PayoutLinkAdditionalProps
 */
export interface PayoutLinkAdditionalProps {
    /**
     * The ID of the counterparty created based on the recipient's details. 
     * 
     * :::note
     * By default, the newly created counterparty is hidden from your counterparties list. 
     * 
     * To automatically save it when the link is claimed, pass the `save_counterparty` parameter set to `true`. 
     * 
     * Alternatively, you can add the recipient to your counterparties later from the list of transactions in the Business app.
     * :::
     * @type {string}
     * @memberof PayoutLinkAdditionalProps
     */
    counterpartyId?: string;
    /**
     * The ID of the created transaction. Returned only if the payout has been claimed.
     * @type {string}
     * @memberof PayoutLinkAdditionalProps
     */
    transactionId?: string;
    /**
     * The reason for which the payout link was cancelled.
     * @type {string}
     * @memberof PayoutLinkAdditionalProps
     */
    readonly cancellationReason?: PayoutLinkAdditionalPropsCancellationReasonEnum;
}


/**
 * @export
 */
export const PayoutLinkAdditionalPropsCancellationReasonEnum = {
    TooManyNameCheckAttempts: 'too_many_name_check_attempts'
} as const;
export type PayoutLinkAdditionalPropsCancellationReasonEnum = typeof PayoutLinkAdditionalPropsCancellationReasonEnum[keyof typeof PayoutLinkAdditionalPropsCancellationReasonEnum];

/**
 * 
 * @export
 * @interface PayoutLinkInitialProps
 */
export interface PayoutLinkInitialProps {
    /**
     * The ID of the payout link.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    id: string;
    /**
     * 
     * @type {PayoutLinkState}
     * @memberof PayoutLinkInitialProps
     */
    state: PayoutLinkState;
    /**
     * The date and time the payout link was created in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    createdAt: string;
    /**
     * The date and time the payout link was last updated in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    updatedAt: string;
    /**
     * The name of the counterparty provided by the sender.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    counterpartyName: string;
    /**
     * Indicates whether you chose to save the recipient as your counterparty upon link claim. 
     * If `false` then the counterparty will not show up on your counterparties list, for example, when you [retrieve your counterparties](https://developer.revolut.com/docs/business/get-counterparties). 
     * However, you can still [retrieve this counterparty by its ID](https://developer.revolut.com/docs/business/get-counterparty).
     * 
     * If you didn't choose to save the counterparty on link creation, you can still do it from your transactions list in the Business app.
     * @type {boolean}
     * @memberof PayoutLinkInitialProps
     */
    saveCounterparty: boolean;
    /**
     * The ID of the request, provided by the sender.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    requestId: string;
    /**
     * The date and time after which the payout link expires in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601).
     * If the recipient doesn't claim the money before then, the payout link expires and is no longer available.
     * 
     * The default and maximum value is the date and time of creating the link + 7 days.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    expiryDate?: string;
    /**
     * The list of payout methods that the recipient can use to claim the payout, where:
     * - `revolut`: Revolut peer-to-peer (P2P) transfer
     * - `bank_account`: External bank transfer
     * - `card`: Card transfer
     *   :::note
     *   - This payout method is available in the UK and the EEA.
     *   - This payout method is not available in Sandbox.
     *   :::
     * @type {Array<PayoutMethod>}
     * @memberof PayoutLinkInitialProps
     */
    payoutMethods: Array<PayoutMethod>;
    /**
     * The ID of the sender's account.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    accountId: string;
    /**
     * The amount of money to be transferred.
     * 
     * :::note
     * The amount must be between £1 and £2,500, or equivalent in the selected currency.
     * :::
     * @type {number}
     * @memberof PayoutLinkInitialProps
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    currency: string;
    /**
     * The URL of the payout link. Returned only for active payout links.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    url?: string;
    /**
     * The reference for the payout transaction, provided by the sender.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    reference: string;
    /**
     * The reason code for the transaction. Transactions to certain countries and currencies might require you to provide a transfer reason. 
     * You can check available reason codes with the [`GET /transfer-reasons` operation](https://developer.revolut.com/docs/business/get-transfer-reasons).
     * 
     * If a transfer reason is not required for the given currency and country, this field is ignored.
     * @type {string}
     * @memberof PayoutLinkInitialProps
     */
    transferReasonCode?: string;
}



/**
 * The state that the payout link is in. Possible states are:
 * - `created`: The payout link has been created, but the amount has not yet been [blocked](https://developer.revolut.com/docs/guides/manage-accounts/transfers/payout-links#sender-link-generation).
 * - `failed`: The payout link couldn't be generated due to a failure during transaction booking.
 * - `awaiting`: The payout link is awaiting approval.
 * - `active`: The payout link can be redeemed.
 * - `expired`: The payout link cannot be redeemed because it wasn't claimed before its expiry date.
 * - `cancelled`: The payout link cannot be redeemed because it was cancelled.
 * - `processing`: The payout link has been redeemed and is being processed.
 * - `processed`: The payout link has been redeemed and the money has been transferred to the recipient.
 * @export
 */
export const PayoutLinkState = {
    Created: 'created',
    Failed: 'failed',
    Awaiting: 'awaiting',
    Active: 'active',
    Expired: 'expired',
    Cancelled: 'cancelled',
    Processing: 'processing',
    Processed: 'processed'
} as const;
export type PayoutLinkState = typeof PayoutLinkState[keyof typeof PayoutLinkState];


/**
 * The payout method that the recipient can use to claim the payout.
 * @export
 */
export const PayoutMethod = {
    Revolut: 'revolut',
    BankAccount: 'bank_account',
    Card: 'card'
} as const;
export type PayoutMethod = typeof PayoutMethod[keyof typeof PayoutMethod];


/**
 * The type of the counterparty.
 * Indicates whether the recipient is an individual or a company.
 * @export
 */
export const ProfileType = {
    Personal: 'personal',
    Business: 'business'
} as const;
export type ProfileType = typeof ProfileType[keyof typeof ProfileType];

/**
 * Successfully created resource.
 * @export
 * @interface ResourceCreatedResponse
 */
export interface ResourceCreatedResponse {
    /**
     * The ID of the created resource.
     * @type {string}
     * @memberof ResourceCreatedResponse
     */
    id?: string;
}
/**
 * 
 * @export
 * @interface Role
 */
export interface Role {
    /**
     * The ID of the role. This can be a UUID or other default role such as `OWNER`.
     * @type {string}
     * @memberof Role
     */
    id: string;
    /**
     * The name of the role.
     * @type {string}
     * @memberof Role
     */
    name: string;
    /**
     * The date and time the role was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Role
     */
    createdAt: string;
    /**
     * The date and time the role was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Role
     */
    updatedAt: string;
}
/**
 * 
 * @export
 * @interface SimulateTopUp200Response
 */
export interface SimulateTopUp200Response {
    /**
     * The ID of the account that was topped up.
     * @type {string}
     * @memberof SimulateTopUp200Response
     */
    id: string;
    /**
     * The state of the top-up transaction.
     * @type {string}
     * @memberof SimulateTopUp200Response
     */
    state: SimulateTopUp200ResponseStateEnum;
    /**
     * The date and time the transaction was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof SimulateTopUp200Response
     */
    createdAt: string;
    /**
     * The date and time the transaction was completed in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof SimulateTopUp200Response
     */
    completedAt?: string;
}


/**
 * @export
 */
export const SimulateTopUp200ResponseStateEnum = {
    Pending: 'pending',
    Completed: 'completed',
    Reverted: 'reverted',
    Failed: 'failed'
} as const;
export type SimulateTopUp200ResponseStateEnum = typeof SimulateTopUp200ResponseStateEnum[keyof typeof SimulateTopUp200ResponseStateEnum];

/**
 * 
 * @export
 * @interface SimulateTopUpRequest
 */
export interface SimulateTopUpRequest {
    /**
     * The ID of the account that you want to top up.
     * @type {string}
     * @memberof SimulateTopUpRequest
     */
    accountId: string;
    /**
     * The amount with which you want to top up the account.
     * @type {number}
     * @memberof SimulateTopUpRequest
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof SimulateTopUpRequest
     */
    currency: string;
    /**
     * A short description for your top up.
     * @type {string}
     * @memberof SimulateTopUpRequest
     */
    reference?: string;
    /**
     * The state to which you want to set the top-up transaction.
     * @type {string}
     * @memberof SimulateTopUpRequest
     */
    state?: SimulateTopUpRequestStateEnum;
}


/**
 * @export
 */
export const SimulateTopUpRequestStateEnum = {
    Pending: 'pending',
    Completed: 'completed',
    Reverted: 'reverted',
    Failed: 'failed'
} as const;
export type SimulateTopUpRequestStateEnum = typeof SimulateTopUpRequestStateEnum[keyof typeof SimulateTopUpRequestStateEnum];

/**
 * 
 * @export
 * @interface SimulateTransferStateUpdate200Response
 */
export interface SimulateTransferStateUpdate200Response {
    /**
     * The ID of the transfer whose state was updated.
     * @type {string}
     * @memberof SimulateTransferStateUpdate200Response
     */
    id: string;
    /**
     * Indicates the simulated transaction state. Possible values:
     * - `completed` - Transaction was successfully processed.
     * - `reverted` - Transaction was reverted by the system or company, but not the user. This can happen for a variety of reasons, for example, the receiver being inaccessible.
     * - `declined` - Transaction was declined to the user for a good reason, such as insufficient account balance, wrong receiver information, etc.
     * - `failed` - Transaction failed during initiation or completion. This can happen for a variety of reasons, for example, invalid API calls, blocked payments, etc.
     * @type {string}
     * @memberof SimulateTransferStateUpdate200Response
     */
    state: SimulateTransferStateUpdate200ResponseStateEnum;
    /**
     * The date and time the transfer was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof SimulateTransferStateUpdate200Response
     */
    createdAt: string;
    /**
     * The date and time the transfer was completed in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof SimulateTransferStateUpdate200Response
     */
    completedAt?: string;
}


/**
 * @export
 */
export const SimulateTransferStateUpdate200ResponseStateEnum = {
    Completed: 'completed',
    Reverted: 'reverted',
    Declined: 'declined',
    Failed: 'failed'
} as const;
export type SimulateTransferStateUpdate200ResponseStateEnum = typeof SimulateTransferStateUpdate200ResponseStateEnum[keyof typeof SimulateTransferStateUpdate200ResponseStateEnum];

/**
 * The [spend program](https://help.revolut.com/business/help/making-paymentsbusiness/spend-controls/setting-card-presets-for-my-team-members/) assigned to the card.
 * :::note
 * To use this property, please contact [Revolut API Support](mailto:api-requests@revolut.com).
 * :::
 * @export
 * @interface SpendProgram
 */
export interface SpendProgram {
    /**
     * The name of the spend program.
     * @type {string}
     * @memberof SpendProgram
     */
    label: string;
}
/**
 * The limit for transactions within a given period.
 * @export
 * @interface SpendingLimitPeriodic
 */
export interface SpendingLimitPeriodic {
    /**
     * The value of the spending limit.
     * @type {number}
     * @memberof SpendingLimitPeriodic
     */
    amount: number;
    /**
     * The currency of the spending limit, provided as [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) code in upper case.
     * @type {string}
     * @memberof SpendingLimitPeriodic
     */
    currency: string;
}
/**
 * The limit for a single transaction.
 * @export
 * @interface SpendingLimitSingleTransaction
 */
export interface SpendingLimitSingleTransaction {
    /**
     * The value of the spending limit.
     * @type {number}
     * @memberof SpendingLimitSingleTransaction
     */
    amount: number;
    /**
     * The currency of the spending limit, provided as [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) code in upper case.
     * @type {string}
     * @memberof SpendingLimitSingleTransaction
     */
    currency: string;
}
/**
 * 
 * @export
 * @interface SpendingLimits
 */
export interface SpendingLimits {
    [key: string]: NULL_SCHEMA_ERR;
}
/**
 * 
 * @export
 * @interface SpendingLimitsSchema
 */
export interface SpendingLimitsSchema {
    /**
     * 
     * @type {SpendingLimitSingleTransaction}
     * @memberof SpendingLimitsSchema
     */
    single?: SpendingLimitSingleTransaction;
    /**
     * 
     * @type {SpendingLimitPeriodic}
     * @memberof SpendingLimitsSchema
     */
    day?: SpendingLimitPeriodic;
    /**
     * 
     * @type {SpendingLimitPeriodic}
     * @memberof SpendingLimitsSchema
     */
    week?: SpendingLimitPeriodic;
    /**
     * 
     * @type {SpendingLimitPeriodic}
     * @memberof SpendingLimitsSchema
     */
    month?: SpendingLimitPeriodic;
    /**
     * 
     * @type {SpendingLimitPeriodic}
     * @memberof SpendingLimitsSchema
     */
    quarter?: SpendingLimitPeriodic;
    /**
     * 
     * @type {SpendingLimitPeriodic}
     * @memberof SpendingLimitsSchema
     */
    year?: SpendingLimitPeriodic;
    /**
     * 
     * @type {SpendingLimitPeriodic}
     * @memberof SpendingLimitsSchema
     */
    allTime?: SpendingLimitPeriodic;
}
/**
 * 
 * @export
 * @interface SpendingPeriodSchema
 */
export interface SpendingPeriodSchema {
    /**
     * The start date (inclusive) of the spending period, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DD`).
     * Uses the [timezone set by the business](https://business.revolut.com/settings/appearance), or defaults to `Europe/London`.
     * @type {string}
     * @memberof SpendingPeriodSchema
     */
    startDate?: string;
    /**
     * The end date (inclusive) of the spending period, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DD`).
     * Uses the [timezone set by the business](https://business.revolut.com/settings/appearance), or defaults to `Europe/London`.
     * @type {string}
     * @memberof SpendingPeriodSchema
     */
    endDate?: string;
    /**
     * The action to take after the end date of the spending period.
     * @type {string}
     * @memberof SpendingPeriodSchema
     */
    endDateAction?: SpendingPeriodSchemaEndDateActionEnum;
}
/**
 * The [tax rate](https://developer.revolut.com/docs/business/tax-rates) applied to the expense split.
 * @export
 * @interface TaxRate
 */
export interface TaxRate {
    /**
     * The ID of the tax rate.
     * @type {string}
     * @memberof TaxRate
     */
    id: string;
    /**
     * The name of the tax.
     * @type {string}
     * @memberof TaxRate
     */
    name: string;
    /**
     * The tax rate percentage applied to the taxable amount. For example, `23` for 23%.
     * @type {number}
     * @memberof TaxRate
     */
    percentage?: number;
}
/**
 * 
 * @export
 * @interface TaxRateResponse
 */
export interface TaxRateResponse {
    /**
     * The unique ID of the tax rate.
     * @type {string}
     * @memberof TaxRateResponse
     */
    readonly id: string;
    /**
     * The name of the tax.
     * @type {string}
     * @memberof TaxRateResponse
     */
    name: string;
    /**
     * The date and time the tax rate was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof TaxRateResponse
     */
    readonly createdAt: string;
    /**
     * The date and time the tax rate was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof TaxRateResponse
     */
    readonly updatedAt: string;
    /**
     * The tax rate percentage applied to the taxable amount. For example, `23` for 23%.
     * 
     * :::note
     * You cannot create negative tax rates manually. 
     * However, negative tax rates might be synced from your accounting software, if integrated. 
     * :::
     * @type {number}
     * @memberof TaxRateResponse
     */
    percentage?: number;
}
/**
 * 
 * @export
 * @interface TeamMember
 */
export interface TeamMember {
    /**
     * The ID of the team member.
     * @type {string}
     * @memberof TeamMember
     */
    id: string;
    /**
     * The email of the team member.
     * @type {string}
     * @memberof TeamMember
     */
    email: string;
    /**
     * The team member's first name.
     * @type {string}
     * @memberof TeamMember
     */
    firstName?: string;
    /**
     * The team member's last name.
     * @type {string}
     * @memberof TeamMember
     */
    lastName?: string;
    /**
     * 
     * @type {TeamMemberState}
     * @memberof TeamMember
     */
    state: TeamMemberState;
    /**
     * The ID of the team member's [role](https://developer.revolut.com/docs/business/get-roles). This can be a UUID or other default role such as `Owner`.
     * @type {string}
     * @memberof TeamMember
     */
    roleId: string;
    /**
     * The date and time the team member was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof TeamMember
     */
    createdAt: string;
    /**
     * The date and time the team member was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof TeamMember
     */
    updatedAt: string;
}



/**
 * The state that the team member is in.
 * @export
 */
export const TeamMemberState = {
    Created: 'created',
    Confirmed: 'confirmed',
    Waiting: 'waiting',
    Active: 'active',
    Locked: 'locked',
    Disabled: 'disabled'
} as const;
export type TeamMemberState = typeof TeamMemberState[keyof typeof TeamMemberState];

/**
 * 
 * @export
 * @interface Transaction
 */
export interface Transaction {
    /**
     * The ID of the transaction.
     * @type {string}
     * @memberof Transaction
     */
    id: string;
    /**
     * 
     * @type {TransactionType}
     * @memberof Transaction
     */
    type: TransactionType;
    /**
     * The request ID that you provided previously.
     * @type {string}
     * @memberof Transaction
     */
    requestId?: string;
    /**
     * 
     * @type {TransactionState}
     * @memberof Transaction
     */
    state: TransactionState;
    /**
     * The reason code when the transaction `state` is `declined` or `failed`.
     * @type {string}
     * @memberof Transaction
     */
    reasonCode?: string;
    /**
     * The date and time the transaction was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Transaction
     */
    createdAt: string;
    /**
     * The date and time the transaction was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Transaction
     */
    updatedAt: string;
    /**
     * The date and time the transaction was completed in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format. 
     * This is required when the transaction `state` is `completed`.
     * @type {string}
     * @memberof Transaction
     */
    completedAt?: string;
    /**
     * The scheduled date of the payment, if applicable.
     * Provided in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof Transaction
     */
    scheduledFor?: string;
    /**
     * The ID of the original transaction to which this transaction is related. 
     * Returned, for example, when this transaction is a refund of the related transaction, or for transactions related to cashback.
     * @type {string}
     * @memberof Transaction
     */
    relatedTransactionId?: string;
    /**
     * 
     * @type {TransactionMerchant}
     * @memberof Transaction
     */
    merchant?: TransactionMerchant;
    /**
     * The payment reference.
     * @type {string}
     * @memberof Transaction
     */
    reference?: string;
    /**
     * The legs of the transaction:
     * - For transactions between your Revolut accounts, there can be 2 legs, for example, an internal transfer made out of the GBP account and into the EUR account.
     * - For transactions in other cases, there is only 1 leg.
     * @type {Array<TransactionLeg>}
     * @memberof Transaction
     */
    legs: Array<TransactionLeg>;
    /**
     * 
     * @type {TransactionCard}
     * @memberof Transaction
     */
    card?: TransactionCard;
}


/**
 * The details of the card associated with the transaction.
 * @export
 * @interface TransactionCard
 */
export interface TransactionCard {
    /**
     * The ID of the card.
     * @type {string}
     * @memberof TransactionCard
     */
    id?: string;
    /**
     * The masked card number.
     * @type {string}
     * @memberof TransactionCard
     */
    cardNumber?: string;
    /**
     * The first name of the cardholder.
     * @type {string}
     * @memberof TransactionCard
     */
    firstName?: string;
    /**
     * The last name of the cardholder.
     * @type {string}
     * @memberof TransactionCard
     */
    lastName?: string;
    /**
     * The phone number of the cardholder in [E.164](https://en.wikipedia.org/wiki/E.164) format.
     * @type {string}
     * @memberof TransactionCard
     */
    phone?: string;
    /**
     * Card references ([`references`](https://developer.revolut.com/docs/business/get-card#response)).
     * 
     * :::note
     * These are the references that were assigned to the card at the time the transaction was made.
     * Any [update](https://developer.revolut.com/docs/business/update-card-references) to card references does not affect existing transactions.
     * :::
     * @type {Array<CardReference>}
     * @memberof TransactionCard
     */
    references?: Array<CardReference>;
}
/**
 * 
 * @export
 * @interface TransactionCounterparty
 */
export interface TransactionCounterparty {
    /**
     * The ID of the counterparty account.
     * @type {string}
     * @memberof TransactionCounterparty
     */
    accountId?: string;
    /**
     * 
     * @type {TransactionCounterpartyAccountType}
     * @memberof TransactionCounterparty
     */
    accountType: TransactionCounterpartyAccountType;
    /**
     * The ID of the counterparty.
     * @type {string}
     * @memberof TransactionCounterparty
     */
    id?: string;
}



/**
 * Indicates the type of the account.
 * @export
 */
export const TransactionCounterpartyAccountType = {
    Self: 'self',
    Revolut: 'revolut',
    External: 'external'
} as const;
export type TransactionCounterpartyAccountType = typeof TransactionCounterpartyAccountType[keyof typeof TransactionCounterpartyAccountType];

/**
 * The legs of the transaction:
 * - For transactions between your Revolut accounts, there can be 2 legs, for example, an internal transfer made out of the BGP account and into the EUR account.
 * - For transactions in other cases, there is only 1 leg.
 * @export
 * @interface TransactionLeg
 */
export interface TransactionLeg {
    /**
     * The ID of the leg.
     * @type {string}
     * @memberof TransactionLeg
     */
    legId: string;
    /**
     * The amount of the transaction.
     * @type {number}
     * @memberof TransactionLeg
     */
    amount: number;
    /**
     * The amount of the transaction fee.
     * @type {number}
     * @memberof TransactionLeg
     */
    fee?: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof TransactionLeg
     */
    currency: string;
    /**
     * The billing amount for cross-currency payments.
     * @type {number}
     * @memberof TransactionLeg
     */
    billAmount?: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof TransactionLeg
     */
    billCurrency?: string;
    /**
     * The ID of the account that the transaction is associated with.
     * @type {string}
     * @memberof TransactionLeg
     */
    accountId: string;
    /**
     * 
     * @type {TransactionCounterparty}
     * @memberof TransactionLeg
     */
    counterparty?: TransactionCounterparty;
    /**
     * The transaction leg purpose.
     * @type {string}
     * @memberof TransactionLeg
     */
    description?: string;
    /**
     * The total balance of the account that the transaction is associated with.
     * @type {number}
     * @memberof TransactionLeg
     */
    balance?: number;
}
/**
 * The information about the merchant (only for card transactions).
 * @export
 * @interface TransactionMerchant
 */
export interface TransactionMerchant {
    /**
     * The ID of the merchant.
     * @type {string}
     * @memberof TransactionMerchant
     */
    id?: string;
    /**
     * The name of the merchant.
     * @type {string}
     * @memberof TransactionMerchant
     */
    name?: string;
    /**
     * The city of the merchant.
     * @type {string}
     * @memberof TransactionMerchant
     */
    city?: string;
    /**
     * The category code of the merchant.
     * @type {string}
     * @memberof TransactionMerchant
     */
    categoryCode?: string;
    /**
     * The bank country of the merchant, provided as an [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * Typically 3 letters, though in some cases, card networks might provide it as a 2-letter code.
     * @type {string}
     * @memberof TransactionMerchant
     */
    country?: string;
}
/**
 * 
 * @export
 * @interface TransactionPaymentRequest
 */
export interface TransactionPaymentRequest {
    /**
     * A unique identifier for the transaction, provided by you.  
     * This is used for idempotency to prevent duplicate payments. 
     * There are no strict format requirements, but we recommend using UUID v4 values.
     * 
     * ::::::tip[Retrying requests safely with idempotency]
     * If you do not receive a response (for example, due to a network error or timeout), you can safely retry the request using the same `request_id`. 
     * 
     * If a transaction with the same `request_id` was already created, the API will not create a duplicate transaction.
     * 
     * :::caution[Idempotency expiry]
     * Idempotency checks apply only to transactions created **within the last 2 weeks**. 
     * Reusing a `request_id` **after this period** may result in a **new transaction being created**.
     * :::
     * ::::::
     * @type {string}
     * @memberof TransactionPaymentRequest
     */
    requestId: string;
    /**
     * The ID of the account that you send the funds from.
     * @type {string}
     * @memberof TransactionPaymentRequest
     */
    accountId: string;
    /**
     * 
     * @type {PaymentReceiver}
     * @memberof TransactionPaymentRequest
     */
    receiver: PaymentReceiver;
    /**
     * The amount to transfer.
     * @type {number}
     * @memberof TransactionPaymentRequest
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof TransactionPaymentRequest
     */
    currency?: string;
    /**
     * The reference for the payment.
     * A piece of text or number you provide to help identify what the payment relates to.
     * It can be used, for example, for reconciliation or tracking purposes.
     * 
     * You might include an invoice number, account or transaction ID, or any other reference meaningful to you.
     * 
     * If the provided reference is longer than 140 characters, it will be truncated.
     * Note that some recipient banks might truncate the reference even further.
     * @type {string}
     * @memberof TransactionPaymentRequest
     */
    reference?: string;
    /**
     * 
     * @type {ChargeBearer}
     * @memberof TransactionPaymentRequest
     */
    chargeBearer?: ChargeBearer;
    /**
     * The reason code for the transaction. Transactions to certain countries and currencies might require you to provide a transfer reason. 
     * You can check available reason codes with the [`GET /transfer-reasons` operation](https://developer.revolut.com/docs/business/get-transfer-reasons).
     * 
     * If a transfer reason is not required for the given currency and country, this field is ignored.
     * @type {string}
     * @memberof TransactionPaymentRequest
     */
    transferReasonCode?: string;
    /**
     * The reason code for the exchange.
     * Depending on the country and the amount of funds to be exchanged, you might be required to provide an exchange reason. 
     * You can check available reason codes with the [`GET /exchange-reasons` operation](https://developer.revolut.com/docs/business/get-exchange-reasons).
     * 
     * If an exchange reason is not required, this field is ignored.
     * @type {string}
     * @memberof TransactionPaymentRequest
     */
    exchangeReasonCode?: string;
}



/**
 * Indicates the transaction state. Possible values:
 *   - `created`: The transaction has been created and is either processed asynchronously or scheduled for a later time.
 *   - `pending`: The transaction is pending until it's being processed. If the transfer is made between Revolut accounts, this state is skipped and the transaction is executed instantly.
 *   - `completed`: The transaction was successful.
 *   - `declined`: The transaction was unsuccessful. This can happen for a variety of reasons, for example, insufficient account balance, wrong receiver information, etc.
 *   - `failed`: The transaction was unsuccessful. This can happen for a variety of reasons, for example, invalid API calls, blocked payments, etc.
 *   - `reverted`: The transaction was reverted. This can happen for a variety of reasons, for example, the receiver being inaccessible.
 * @export
 */
export const TransactionState = {
    Created: 'created',
    Pending: 'pending',
    Completed: 'completed',
    Declined: 'declined',
    Failed: 'failed',
    Reverted: 'reverted'
} as const;
export type TransactionState = typeof TransactionState[keyof typeof TransactionState];


/**
 * Indicates the transaction type.
 * @export
 */
export const TransactionType = {
    Atm: 'atm',
    CardPayment: 'card_payment',
    CardRefund: 'card_refund',
    CardChargeback: 'card_chargeback',
    CardCredit: 'card_credit',
    Charge: 'charge',
    ChargeRefund: 'charge_refund',
    Exchange: 'exchange',
    Transfer: 'transfer',
    Loan: 'loan',
    Fee: 'fee',
    Refund: 'refund',
    Topup: 'topup',
    TopupReturn: 'topup_return',
    Tax: 'tax',
    TaxRefund: 'tax_refund'
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

/**
 * 
 * @export
 * @interface TransferReason
 */
export interface TransferReason {
    /**
     * The counterparty's bank country, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof TransferReason
     */
    country: string;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof TransferReason
     */
    currency: string;
    /**
     * Category name of the transfer reason.
     * @type {string}
     * @memberof TransferReason
     */
    code: TransferReasonCodeEnum;
    /**
     * The description of the given transfer reason.
     * @type {string}
     * @memberof TransferReason
     */
    description: string;
}


/**
 * @export
 */
export const TransferReasonCodeEnum = {
    Advertising: 'advertising',
    AdvisorFees: 'advisor_fees',
    BusinessInsurance: 'business_insurance',
    Construction: 'construction',
    Delivery: 'delivery',
    Education: 'education',
    Family: 'family',
    FundInvestment: 'fund_investment',
    Goods: 'goods',
    Homesend: 'homesend',
    Hotel: 'hotel',
    Exports: 'exports',
    InsuranceClaims: 'insurance_claims',
    InsurancePremium: 'insurance_premium',
    LoanRepayment: 'loan_repayment',
    Medical: 'medical',
    Office: 'office',
    OtherFees: 'other_fees',
    PersonalTransfer: 'personal_transfer',
    PropertyPurchase: 'property_purchase',
    PropertyRental: 'property_rental',
    Royalties: 'royalties',
    Services: 'services',
    ShareInvestment: 'share_investment',
    Tax: 'tax',
    Transfer: 'transfer',
    Transportation: 'transportation',
    Travel: 'travel',
    Utilities: 'utilities'
} as const;
export type TransferReasonCodeEnum = typeof TransferReasonCodeEnum[keyof typeof TransferReasonCodeEnum];

/**
 * Transfer the funds between accounts of the business in the same currency.
 * @export
 * @interface TransferRequest
 */
export interface TransferRequest {
    /**
     * The ID of the request, provided by you.
     * It helps you identify the transaction in your system.
     * 
     * :::caution
     * To ensure that a transfer is not processed multiple times if there are network or system errors,
     * the same `request_id` should be used for requests related to the same transfer.
     * :::
     * @type {string}
     * @memberof TransferRequest
     */
    requestId: string;
    /**
     * The ID of the source account that you transfer the funds from.
     * @type {string}
     * @memberof TransferRequest
     */
    sourceAccountId: string;
    /**
     * The ID of the target account that you transfer the funds to.
     * @type {string}
     * @memberof TransferRequest
     */
    targetAccountId: string;
    /**
     * The amount of the funds to be transferred.
     * @type {number}
     * @memberof TransferRequest
     */
    amount: number;
    /**
     * [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code in upper case.
     * @type {string}
     * @memberof TransferRequest
     */
    currency: string;
    /**
     * The reference for the funds transfer.
     * @type {string}
     * @memberof TransferRequest
     */
    reference?: string;
}
/**
 * 
 * @export
 * @interface TransferResponse
 */
export interface TransferResponse {
    /**
     * The ID of the transaction created.
     * @type {string}
     * @memberof TransferResponse
     */
    id: string;
    /**
     * 
     * @type {TransactionState}
     * @memberof TransferResponse
     */
    state: TransactionState;
    /**
     * The date and time the transaction was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof TransferResponse
     */
    createdAt: string;
    /**
     * The date and time the transaction was completed in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof TransferResponse
     */
    completedAt?: string;
}


/**
 * The new settings for the accounting category.
 * @export
 * @interface UpdateAccountingCategoryRequest
 */
export interface UpdateAccountingCategoryRequest {
    /**
     * The new full name for the accounting category.
     * @type {string}
     * @memberof UpdateAccountingCategoryRequest
     */
    name?: string;
    /**
     * The new code name for the accounting category.
     * @type {string}
     * @memberof UpdateAccountingCategoryRequest
     */
    code?: string;
    /**
     * The ID of the new default [tax rate](https://developer.revolut.com/docs/business/get-tax-rate) that should be applied to items in this accounting category unless overridden for a specific item.
     * @type {string}
     * @memberof UpdateAccountingCategoryRequest
     */
    defaultTaxRateId?: string;
}
/**
 * 
 * @export
 * @interface UpdateCardInvitationRequest
 */
export interface UpdateCardInvitationRequest {
    /**
     * The label of the card.
     * 
     * Cards without labels are not allowed.
     * If set to `null`, the default label will be set according to the card's type.
     * 
     * :::tip[Default labels]
     * For virtual cards, the default label is `Virtual`.
     * For physical cards, depending on the type, it can be, for example, `Standard` or `Metal`. 
     * 
     * As these values depend on available card types, they are subject to change over time.
     * :::
     * @type {string}
     * @memberof UpdateCardInvitationRequest
     */
    label?: string;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof UpdateCardInvitationRequest
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They let you set or modify the dates when the card should become available or unavailable for spending, and define what happens after the end date.
     * 
     * If specified, you must provide at least one of these:
     * - `start_date`
     * - `end_date` together with `end_date_action`
     * 
     * The spending period dates must be in the future.
     * 
     * The dates are inclusive.
     * This means that:
     * - If you set the `start_date` to `2026-03-31`, the card will become active on that day.
     * - If you set the `end_date` to `2027-12-31`, the card will be active through that day, and will be locked/terminated starting on 1st Jan 2028.
     * 
     * :::note
     * You can update the spending period settings in a few ways, depending on your use case:
     * - To remove the start date, but keep the end date settings, provide the current `spending_period` settings without the `start_date`.
     * - To remove the start date when no end date is set, provide the `spending_period.start_date` set to `null`.
     * - To remove **all** spending period settings, provide `spending_period` set to `null`.
     * 
     * If you wish to erase a spending period end date, you can do this in a similar way, applying the steps to `spending_period.end_date` and `spending_period.end_date_action`.
     * :::
     * @type {SpendingPeriodSchema}
     * @memberof UpdateCardInvitationRequest
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories to be available for card spending.
     * Use `null` to erase the value and reset to empty (all categories will be allowed).
     * 
     * :::note
     * The `categories` and `merchant_controls` parameters have the following restrictions:
     * - If you set `categories`, you **cannot** set `merchant_controls.control_type` to `allow`.
     * - You **can** set `merchant_controls.control_type` to `block`.
     * - You may also set **either** `categories` or `merchant_controls` independently, or **set neither**.
     * - Both parameters can be used together **only** if `merchant_controls.control_type` is `block`.
     * :::
     * @type {Array<BusinessMerchantCategory>}
     * @memberof UpdateCardInvitationRequest
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof UpdateCardInvitationRequest
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the card can be used, provided as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof UpdateCardInvitationRequest
     */
    countries?: Array<string>;
    /**
     * The list of accounts to link to the card.
     * If not specified, all accounts will be linked.
     * To retrieve account IDs, use the [`GET /accounts` operation](https://developer.revolut.com/docs/business/get-accounts).
     * @type {Array<string>}
     * @memberof UpdateCardInvitationRequest
     */
    accounts?: Array<string>;
}
/**
 * 
 * @export
 * @interface UpdateCardRequest
 */
export interface UpdateCardRequest {
    /**
     * The label of the card.
     * @type {string}
     * @memberof UpdateCardRequest
     */
    label?: string;
    /**
     * 
     * @type {SpendingLimitsSchema}
     * @memberof UpdateCardRequest
     */
    spendingLimits?: SpendingLimitsSchema;
    /**
     * The controls for the card's spending period.
     * 
     * They let you set or modify the dates when the card becomes available or unavailable for spending, and define what happens after the end date.
     * 
     * If specified, you must provide at least one of these:
     * - `start_date`
     * - `end_date` together with `end_date_action`
     * 
     * The spending period dates must be in the future.
     * 
     * The dates are inclusive.
     * This means that:
     * - If you set the `start_date` to `2025-12-31`, the card will become active on that day.
     * - If you set the `end_date` to `2026-06-01`, the card will be active through that day, and will be locked/terminated starting on 2nd June 2026.
     * 
     * :::note                    
     * If you wish to unlock a card with a spending period starting in the future and make it available for spending right away, you can do it in a few ways, depending on your use case:
     * - To remove the start date, but keep the end date settings, provide the current `spending_period` settings without the `start_date`.
     * - To remove the start date when no end date is set, provide the `spending_period.start_date` set to `null`.
     * - To remove **all** spending period settings, either provide `spending_period` set to `null`, or use the dedicated endpoint to [unlock](https://developer.revolut.com/docs/business/unlock-card) the card.
     * 
     * If you wish to erase a spending period end date, you can do this in a similar way, applying the steps to `spending_period.end_date` and `spending_period.end_date_action`.
     * :::
     * @type {SpendingPeriodSchema}
     * @memberof UpdateCardRequest
     */
    spendingPeriod?: SpendingPeriodSchema | null;
    /**
     * The list of merchant categories that will be available for card spending.
     * Use `null` to erase the value and reset to empty (all categories will be allowed).
     * 
     * :::note
     * The `categories` and `merchant_controls` parameters have the following restrictions:
     * - If you set `categories`, you **cannot** set `merchant_controls.control_type` to `allow`.
     * - You **can** set `merchant_controls.control_type` to `block`.
     * - You may also set **either** `categories` or `merchant_controls` independently, or **set neither**.
     * - Both parameters can be used together **only** if `merchant_controls.control_type` is `block`.
     * :::
     * @type {Array<BusinessMerchantCategory>}
     * @memberof UpdateCardRequest
     */
    categories?: Array<BusinessMerchantCategory>;
    /**
     * 
     * @type {MerchantControlsSchema}
     * @memberof UpdateCardRequest
     */
    merchantControls?: MerchantControlsSchema;
    /**
     * The list of countries where the card can be used, provided as 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) codes.
     * @type {Array<string>}
     * @memberof UpdateCardRequest
     */
    countries?: Array<string>;
    /**
     * The list of accounts to link to the card.
     * If not specified, all accounts will be linked.
     * To retrieve account IDs, use the [`GET /accounts` operation](https://developer.revolut.com/docs/business/get-accounts).
     * @type {Array<string>}
     * @memberof UpdateCardRequest
     */
    accounts?: Array<string>;
}
/**
 * The new name for the label group.
 * @export
 * @interface UpdateLabelGroupRequest
 */
export interface UpdateLabelGroupRequest {
    /**
     * The new name for the label group.
     * @type {string}
     * @memberof UpdateLabelGroupRequest
     */
    name: string;
}
/**
 * The new name for the label.
 * @export
 * @interface UpdateLabelRequest
 */
export interface UpdateLabelRequest {
    /**
     * The new name for the label.
     * @type {string}
     * @memberof UpdateLabelRequest
     */
    name: string;
}
/**
 * The new setting for the tax rate.
 * @export
 * @interface UpdateTaxRateRequest
 */
export interface UpdateTaxRateRequest {
    /**
     * The new name for the tax rate.
     * @type {string}
     * @memberof UpdateTaxRateRequest
     */
    name?: string;
}
/**
 * 
 * @export
 * @interface UpdateWebhookRequest
 */
export interface UpdateWebhookRequest {
    /**
     * A valid webhook URL to which to send event notifications. The supported protocol is `https`.
     * @type {string}
     * @memberof UpdateWebhookRequest
     */
    url?: string;
    /**
     * A list of event types to subscribe to.
     * @type {Array<WebhookEventType>}
     * @memberof UpdateWebhookRequest
     */
    events?: Array<WebhookEventType>;
}
/**
 * 
 * @export
 * @interface ValidateAccountName400Response
 */
export interface ValidateAccountName400Response {
    /**
     * The error code.
     * @type {number}
     * @memberof ValidateAccountName400Response
     */
    code: number;
    /**
     * The description of the error.
     * @type {string}
     * @memberof ValidateAccountName400Response
     */
    message: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountName401Response
 */
export interface ValidateAccountName401Response {
    /**
     * The description of the error.
     * @type {string}
     * @memberof ValidateAccountName401Response
     */
    message: string;
    /**
     * The HTTP error code.
     * @type {string}
     * @memberof ValidateAccountName401Response
     */
    status?: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameRequestAU
 */
export interface ValidateAccountNameRequestAU {
    /**
     * The account number of the counterparty.
     * @type {string}
     * @memberof ValidateAccountNameRequestAU
     */
    accountNo: string;
    /**
     * The BSB (Bank-State-Branch) number for the counterparty's account.
     * Used to identify the bank and branch in Australia.
     * @type {string}
     * @memberof ValidateAccountNameRequestAU
     */
    bsb: string;
    /**
     * The name of the business counterparty.
     * 
     * **Required** when the account type is business (`individual_name` is not specified).
     * 
     * @type {string}
     * @memberof ValidateAccountNameRequestAU
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameRequestUKIndividualName}
     * @memberof ValidateAccountNameRequestAU
     */
    individualName?: ValidateAccountNameRequestUKIndividualName;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameRequestEUR
 */
export interface ValidateAccountNameRequestEUR {
    /**
     * The IBAN (International Bank Account Number) for the counterparty's account.
     * @type {string}
     * @memberof ValidateAccountNameRequestEUR
     */
    iban: string;
    /**
     * The BIC (Bank Identifier Code) for the counterparty's account.
     * Also known as the SWIFT code.
     * It can be provided, for example, when the automatic BIC detection fails and the check is unsuccessful.
     * @type {string}
     * @memberof ValidateAccountNameRequestEUR
     */
    bic?: string;
    /**
     * The counterparty's bank country, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * @type {string}
     * @memberof ValidateAccountNameRequestEUR
     */
    recipientCountry: string;
    /**
     * The counterparty account’s currency, provided as a 3-letter [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) code.
     * 
     * For VoP, the **possible value** is `EUR`.
     * 
     * @type {string}
     * @memberof ValidateAccountNameRequestEUR
     */
    recipientCurrency: string;
    /**
     * The name of the business counterparty.
     * 
     * **Required** when the account type is business (`individual_name` is not specified).
     * 
     * @type {string}
     * @memberof ValidateAccountNameRequestEUR
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameRequestUKIndividualName}
     * @memberof ValidateAccountNameRequestEUR
     */
    individualName?: ValidateAccountNameRequestUKIndividualName;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameRequestRO
 */
export interface ValidateAccountNameRequestRO {
    /**
     * The IBAN (International Bank Account Number) for the counterparty's account.
     * @type {string}
     * @memberof ValidateAccountNameRequestRO
     */
    iban: string;
    /**
     * The BIC (Bank Identifier Code) for the counterparty's account.
     * Also known as the SWIFT code.
     * This value is optional. 
     * It can be provided, for example, when the automatic BIC detection fails and the check is unsuccessful.
     * @type {string}
     * @memberof ValidateAccountNameRequestRO
     */
    bic?: string;
    /**
     * The counterparty's bank country, provided as a 2-letter [ISO 3166](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) code.
     * 
     * For RO CoP, the **possible value** is `RO`.
     * @type {string}
     * @memberof ValidateAccountNameRequestRO
     */
    recipientCountry: string;
    /**
     * The counterparty account’s currency, provided as a 3-letter [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) code.
     * 
     * For RO CoP, the **possible value** is `RON`.
     * 
     * @type {string}
     * @memberof ValidateAccountNameRequestRO
     */
    recipientCurrency: string;
    /**
     * The name of the business counterparty.
     * 
     * **Required** when the account type is business (`individual_name` is not specified).
     * 
     * ⓘ Note that for [RO](https://developer.revolut.com/docs/guides/manage-accounts/counterparties/confirmation-of-payee#supported-regions-and-services), the name you provide helps identify the request, but is **not** used for the actual check.
     * The API simply returns the partially masked name associated with the IBAN for you to validate.
     * Therefore, the returned name may differ from the one you provide.
     * 
     * @type {string}
     * @memberof ValidateAccountNameRequestRO
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameRequestROIndividualName}
     * @memberof ValidateAccountNameRequestRO
     */
    individualName?: ValidateAccountNameRequestROIndividualName;
}
/**
 * The name of the individual counterparty, split into first name and last name.
 * 
 * **Required** when the account type is personal (`company_name` isn't specified).
 * 
 * ⓘ Note that for [RO](https://developer.revolut.com/docs/guides/manage-accounts/counterparties/confirmation-of-payee#supported-regions-and-services), the name you provide helps identify the request, but is **not** used for the actual check.
 * The API simply returns the partially masked name associated with the IBAN for you to validate.
 * Therefore, the returned name may differ from the one you provide.
 * 
 * @export
 * @interface ValidateAccountNameRequestROIndividualName
 */
export interface ValidateAccountNameRequestROIndividualName {
    /**
     * The first name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameRequestROIndividualName
     */
    firstName: string;
    /**
     * The last name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameRequestROIndividualName
     */
    lastName: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameRequestUK
 */
export interface ValidateAccountNameRequestUK {
    /**
     * The account number of the counterparty.
     * @type {string}
     * @memberof ValidateAccountNameRequestUK
     */
    accountNo: string;
    /**
     * The sort code of the counterparty's account.
     * @type {string}
     * @memberof ValidateAccountNameRequestUK
     */
    sortCode: string;
    /**
     * The name of the business counterparty.
     * 
     * **Required** when the account type is business (`individual_name` is not specified).
     * 
     * @type {string}
     * @memberof ValidateAccountNameRequestUK
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameRequestUKIndividualName}
     * @memberof ValidateAccountNameRequestUK
     */
    individualName?: ValidateAccountNameRequestUKIndividualName;
}
/**
 * The name of the individual counterparty, split into first name and last name.
 * 
 * **Required** when the account type is personal (`company_name` isn't specified).
 * 
 * @export
 * @interface ValidateAccountNameRequestUKIndividualName
 */
export interface ValidateAccountNameRequestUKIndividualName {
    /**
     * The first name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameRequestUKIndividualName
     */
    firstName: string;
    /**
     * The last name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameRequestUKIndividualName
     */
    lastName: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameResponseAU
 */
export interface ValidateAccountNameResponseAU {
    /**
     * The result of the check. 
     * 
     * Possible values for AU:
     * - **`matched`:** The name matches the provided details.
     *   For personal accounts, this also covers **close matches**, in which case the **actual name** is returned.
     * - **`close_match` (business account):** The name is similar to the provided value.
     * - **`not_matched`:** The name doesn't match the provided values.
     * - **`cannot_be_checked`:** The check cannot be performed and retries won't help.
     *   For example, the recipient's bank doesn't support CoP.
     * - **`temporarily_unavailable`:** The check cannot be performed right now.
     *   For example, the recipient's bank didn't respond to our request.
     *   You should retry the request later.
     * @type {string}
     * @memberof ValidateAccountNameResponseAU
     */
    resultCode: ValidateAccountNameResponseAUResultCodeEnum;
    /**
     * 
     * @type {AccountNameValidationReasonAU}
     * @memberof ValidateAccountNameResponseAU
     */
    reason?: AccountNameValidationReasonAU;
    /**
     * The name of the recipient when the account type is business.
     * Provided only if `individual_name` is not specified.
     * 
     * When the name is a close match, the actual full name is returned.
     * Otherwise, the name you provided is returned.
     * 
     * :::tip[Mismatched name type is corrected]
     * The mismatched name type in the request is corrected in the response.
     * This means that, for example, if an individual recipient's name was provided under `company_name`, in the response it is returned under `individual_name`.
     * :::
     * @type {string}
     * @memberof ValidateAccountNameResponseAU
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameResponseAUIndividualName}
     * @memberof ValidateAccountNameResponseAU
     */
    individualName?: ValidateAccountNameResponseAUIndividualName;
}


/**
 * @export
 */
export const ValidateAccountNameResponseAUResultCodeEnum = {
    Matched: 'matched',
    CloseMatch: 'close_match',
    NotMatched: 'not_matched',
    CannotBeChecked: 'cannot_be_checked',
    TemporarilyUnavailable: 'temporarily_unavailable'
} as const;
export type ValidateAccountNameResponseAUResultCodeEnum = typeof ValidateAccountNameResponseAUResultCodeEnum[keyof typeof ValidateAccountNameResponseAUResultCodeEnum];

/**
 * The name of the recipient when the account type is personal.
 * Provided only if `company_name` is not specified.
 * 
 * When the name is a close match, the actual first and last names are returned.
 * Otherwise, the name you provided is returned.
 * 
 * :::tip[Mismatched name type is corrected]
 * The mismatched name type in the request is corrected in the response.
 * This means that, for example, if an individual recipient's name was provided under `company_name`, in the response it is returned under `individual_name`.
 * :::
 * @export
 * @interface ValidateAccountNameResponseAUIndividualName
 */
export interface ValidateAccountNameResponseAUIndividualName {
    /**
     * The first name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseAUIndividualName
     */
    firstName: string;
    /**
     * The last name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseAUIndividualName
     */
    lastName: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameResponseEUR
 */
export interface ValidateAccountNameResponseEUR {
    /**
     * The result of the check. 
     * 
     * Possible values for EUR:
     * - **`matched`:** The name matches the provided details.
     * - **`close_match`:** The recipient's name is similar to the provided value.
     *   The **actual name** is returned.
     * - **`not_matched`:** The name and account type don't match the provided values.
     *   The **name provided in the request** is returned.
     * - **`cannot_be_checked`:** The check cannot be performed and retries won't help.
     *   For example, the recipient's bank doesn't support VoP.
     * - **`temporarily_unavailable`:** The check cannot be performed right now.
     *   For example, the recipient's bank didn't respond to our request.
     *   You should retry the request later.
     * @type {string}
     * @memberof ValidateAccountNameResponseEUR
     */
    resultCode: ValidateAccountNameResponseEURResultCodeEnum;
    /**
     * 
     * @type {AccountNameValidationReasonEUR}
     * @memberof ValidateAccountNameResponseEUR
     */
    reason?: AccountNameValidationReasonEUR;
    /**
     * The name of the recipient when the account type is business.
     * Provided only if `individual_name` is not specified.
     * 
     * When the name is a close match, the actual name is returned.
     * Otherwise, the name you provided is returned.
     * 
     * :::caution[Mismatched name type is not corrected]
     * The name type in the response is returned as it was provided in the request.
     * For example, if an individual recipient's name was provided under `company_name`, in the response it's still returned under `company_name` (instead of `individual_name`).
     * :::
     * @type {string}
     * @memberof ValidateAccountNameResponseEUR
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameResponseEURIndividualName}
     * @memberof ValidateAccountNameResponseEUR
     */
    individualName?: ValidateAccountNameResponseEURIndividualName;
}


/**
 * @export
 */
export const ValidateAccountNameResponseEURResultCodeEnum = {
    Matched: 'matched',
    CloseMatch: 'close_match',
    NotMatched: 'not_matched',
    CannotBeChecked: 'cannot_be_checked',
    TemporarilyUnavailable: 'temporarily_unavailable'
} as const;
export type ValidateAccountNameResponseEURResultCodeEnum = typeof ValidateAccountNameResponseEURResultCodeEnum[keyof typeof ValidateAccountNameResponseEURResultCodeEnum];

/**
 * The name of the recipient when the account type is personal.
 * Provided only if `company_name` is not specified.
 * 
 * When the name is a close match, the actual name is returned.
 * Otherwise, the name you provided is returned.
 * 
 * :::caution[Mismatched name type is not corrected]
 * The name type in the response is returned as it was provided in the request.
 * For example, if an individual recipient's name was provided under `company_name`, in the response it's still returned under `company_name` (instead of `individual_name`).
 * :::
 * @export
 * @interface ValidateAccountNameResponseEURIndividualName
 */
export interface ValidateAccountNameResponseEURIndividualName {
    /**
     * The first name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseEURIndividualName
     */
    firstName: string;
    /**
     * The last name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseEURIndividualName
     */
    lastName: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameResponseRO
 */
export interface ValidateAccountNameResponseRO {
    /**
     * The result of the check. 
     * 
     * For RO CoP, the API **checks if an account exists for the provided IBAN**.
     * Possible results are:
     * - **`matched`:** An account with the provided IBAN was found.
     *   When this status is returned, the API also returns a partial name of the account holder.
     *   Use this returned name to validate your recipient's details.
     * - **`cannot_be_checked`:** The check cannot be performed and retries won't help.
     *     For example, the recipient's bank doesn't support CoP.
     * - **`temporarily_unavailable`:** The check cannot be performed right now.
     *   For example, the recipient's bank didn't respond to our request.
     *   You should retry the request later.
     * @type {string}
     * @memberof ValidateAccountNameResponseRO
     */
    resultCode: ValidateAccountNameResponseROResultCodeEnum;
    /**
     * 
     * @type {AccountNameValidationReasonRO}
     * @memberof ValidateAccountNameResponseRO
     */
    reason?: AccountNameValidationReasonRO;
    /**
     * The **partially masked** name of the recipient when the account type is business.
     * Provided only if `individual_name` is not specified.
     * 
     * :::caution[Name considerations]
     * - The name you provide helps identify the request, but is not used for the actual check.
     *   The API simply returns the partial name associated with the IBAN for you to validate.
     *   Therefore, the **returned name may differ** from the one you provided.
     * - **Mismatched name type is not corrected**.
     *   This means that the name type in the response is returned as it was provided in the request.
     *   For example, if an individual recipient's name was provided under `company_name`, in the response it's still returned under `company_name` (instead of `individual_name`).
     * :::
     * @type {string}
     * @memberof ValidateAccountNameResponseRO
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameResponseROIndividualName}
     * @memberof ValidateAccountNameResponseRO
     */
    individualName?: ValidateAccountNameResponseROIndividualName;
}


/**
 * @export
 */
export const ValidateAccountNameResponseROResultCodeEnum = {
    Matched: 'matched',
    CloseMatch: 'close_match',
    NotMatched: 'not_matched',
    CannotBeChecked: 'cannot_be_checked',
    TemporarilyUnavailable: 'temporarily_unavailable'
} as const;
export type ValidateAccountNameResponseROResultCodeEnum = typeof ValidateAccountNameResponseROResultCodeEnum[keyof typeof ValidateAccountNameResponseROResultCodeEnum];

/**
 * The partial name of the recipient when the account type is personal, that is, the first name and the last name's initial.
 * Provided only if `company_name` is not specified.
 * 
 * :::caution[Name considerations]
 * - The name you provide helps identify the request, but is not used for the actual check.
 *   The API simply returns the partial name associated with the IBAN for you to validate.
 *   Therefore, the **returned name may differ** from the one you provided.
 * - **Mismatched name type is not corrected**.
 *   This means that the name type in the response is returned as it was provided in the request.
 *   For example, if an individual recipient's name was provided under `company_name`, in the response it's still returned under `company_name` (instead of `individual_name`).
 * :::
 * @export
 * @interface ValidateAccountNameResponseROIndividualName
 */
export interface ValidateAccountNameResponseROIndividualName {
    /**
     * The first name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseROIndividualName
     */
    firstName: string;
    /**
     * The initial of the last name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseROIndividualName
     */
    lastName: string;
}
/**
 * 
 * @export
 * @interface ValidateAccountNameResponseUK
 */
export interface ValidateAccountNameResponseUK {
    /**
     * The result of the check. 
     * 
     * Possible values for UK:
     * - **`matched`:** The name and account type match the provided details.
     * - **`close_match`:** The name and/or account type are similar to the provided values:
     *   - The name is a match, but the account type is incorrect.
     *     For example, an individual recipient's name was provided under `company_name`.
     *     The **actual account type** is returned.
     *   - The name is similar to the provided values.
     *     Account type is correct.
     *     The **actual name** is returned.
     *   - The name is similar to the provided values, and the account type is incorrect.
     *     The **actual values** are returned.
     * 
     *   The actual values are returned.
     * - **`not_matched`:** The name and account type don't match the provided values.
     * - **`cannot_be_checked`:** The check cannot be performed and retries won't help.
     *   For example, the recipient's bank doesn't support CoP.
     * - **`temporarily_unavailable`:** The check cannot be performed right now.
     *   For example, the recipient's bank didn't respond to our request.
     *   You should retry the request later.
     * @type {string}
     * @memberof ValidateAccountNameResponseUK
     */
    resultCode: ValidateAccountNameResponseUKResultCodeEnum;
    /**
     * 
     * @type {AccountNameValidationReasonUK}
     * @memberof ValidateAccountNameResponseUK
     */
    reason?: AccountNameValidationReasonUK;
    /**
     * The name of the recipient when the account type is business.
     * Provided only if `individual_name` is not specified.
     * 
     * When the name is a close match, the actual full name is returned, otherwise, the name you provided is returned.
     * @type {string}
     * @memberof ValidateAccountNameResponseUK
     */
    companyName?: string;
    /**
     * 
     * @type {ValidateAccountNameResponseUKIndividualName}
     * @memberof ValidateAccountNameResponseUK
     */
    individualName?: ValidateAccountNameResponseUKIndividualName;
}


/**
 * @export
 */
export const ValidateAccountNameResponseUKResultCodeEnum = {
    Matched: 'matched',
    CloseMatch: 'close_match',
    NotMatched: 'not_matched',
    CannotBeChecked: 'cannot_be_checked',
    TemporarilyUnavailable: 'temporarily_unavailable'
} as const;
export type ValidateAccountNameResponseUKResultCodeEnum = typeof ValidateAccountNameResponseUKResultCodeEnum[keyof typeof ValidateAccountNameResponseUKResultCodeEnum];

/**
 * The name of the recipient when the account type is personal.
 * Provided only if `company_name` is not specified.
 * 
 * When the name is a close match, the actual first and last names are returned in full.
 * @export
 * @interface ValidateAccountNameResponseUKIndividualName
 */
export interface ValidateAccountNameResponseUKIndividualName {
    /**
     * The first name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseUKIndividualName
     */
    firstName: string;
    /**
     * The last name of the recipient.
     * @type {string}
     * @memberof ValidateAccountNameResponseUKIndividualName
     */
    lastName: string;
}
/**
 * A webhook event
 * @export
 * @interface WebhookEvent
 */
export interface WebhookEvent {
    /**
     * The ID of the webhook event.
     * @type {string}
     * @memberof WebhookEvent
     */
    id: string;
    /**
     * The date and time the event was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof WebhookEvent
     */
    createdAt: string;
    /**
     * The date and time the event was last updated in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof WebhookEvent
     */
    updatedAt: string;
    /**
     * The ID of the webhook for which the event failed.
     * @type {string}
     * @memberof WebhookEvent
     */
    webhookId: string;
    /**
     * The valid webhook URL that event notifications are sent to. The supported protocol is `https`.
     * @type {string}
     * @memberof WebhookEvent
     */
    webhookUrl: string;
    /**
     * The details of the failed event.
     * @type {object}
     * @memberof WebhookEvent
     */
    payload: object;
    /**
     * The date and time the last attempt at the event delivery occurred in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     * @type {string}
     * @memberof WebhookEvent
     */
    lastSentDate?: string;
}

/**
 * The type of the webhook event to subscribe to.
 * @export
 */
export const WebhookEventType = {
    TransactionCreated: 'TransactionCreated',
    TransactionStateChanged: 'TransactionStateChanged',
    PayoutLinkCreated: 'PayoutLinkCreated',
    PayoutLinkStateChanged: 'PayoutLinkStateChanged'
} as const;
export type WebhookEventType = typeof WebhookEventType[keyof typeof WebhookEventType];

/**
 * 
 * @export
 * @interface WebhookSigningSecretRotateRequest
 */
export interface WebhookSigningSecretRotateRequest {
    /**
     * The expiration period for the signing secret in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601#Durations). If set, when you rotate the secret, it continues to be valid until the expiration period has passed. Otherwise, on rotation, the secret is invalidated immediately. The maximum value is 7 days.
     * @type {string}
     * @memberof WebhookSigningSecretRotateRequest
     */
    expirationPeriod?: string;
}
/**
 * 
 * @export
 * @interface WebhookV1
 */
export interface WebhookV1 {
    /**
     * The valid webhook URL that event notifications are sent to. The supported protocol is `https`.
     * @type {string}
     * @memberof WebhookV1
     */
    url: string;
}
/**
 * 
 * @export
 * @interface WebhookV2
 */
export interface WebhookV2 {
    /**
     * The ID of the webhook.
     * @type {string}
     * @memberof WebhookV2
     */
    id: string;
    /**
     * The valid webhook URL that event notifications are sent to. The supported protocol is `https`.
     * @type {string}
     * @memberof WebhookV2
     */
    url: string;
    /**
     * The list of event types that you are subscribed to.
     * @type {Array<WebhookEventType>}
     * @memberof WebhookV2
     */
    events: Array<WebhookEventType>;
    /**
     * The signing secret for the webhook.
     * @type {string}
     * @memberof WebhookV2
     */
    signingSecret: string;
}
/**
 * 
 * @export
 * @interface WebhookV2Basic
 */
export interface WebhookV2Basic {
    /**
     * The ID of the webhook.
     * @type {string}
     * @memberof WebhookV2Basic
     */
    id: string;
    /**
     * The valid webhook URL that event notifications are sent to. The supported protocol is `https`.
     * @type {string}
     * @memberof WebhookV2Basic
     */
    url: string;
    /**
     * The list of event types that you are subscribed to.
     * @type {Array<WebhookEventType>}
     * @memberof WebhookV2Basic
     */
    events: Array<WebhookEventType>;
}
