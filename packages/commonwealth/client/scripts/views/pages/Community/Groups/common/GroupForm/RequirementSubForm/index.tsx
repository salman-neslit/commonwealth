import React from 'react';
import { CWIconButton } from 'views/components/component_kit/cw_icon_button';
import { CWSelectList } from 'views/components/component_kit/new_designs/CWSelectList';
import { CWTextInput } from 'views/components/component_kit/new_designs/CWTextInput';
import { RequirementSubFormType } from '../index.types';
import './index.scss';
import {
  AMOUNT_CONDITIONS,
  BLOCKCHAINS,
  TOKENS,
  SPECIFICATIONS,
} from '../constants';

const requirementTypes = [
  { value: TOKENS.COSMOS_TOKEN, label: 'Cosmos base tokens' },
  { value: SPECIFICATIONS.ERC_20, label: 'ERC-20' },
  { value: SPECIFICATIONS.ERC_721, label: 'ERC-721' },
  { value: TOKENS.EVM_TOKEN, label: 'EVM base tokens' },
];
const chainTypes = [
  { value: BLOCKCHAINS.AXIE_INFINITY, label: 'Axie Infinity' },
  { value: BLOCKCHAINS.COSMOS, label: 'Cosmos' },
  { value: BLOCKCHAINS.ETHEREUM, label: 'Ethereum' },
  { value: BLOCKCHAINS.INJECTIVE, label: 'Injective' },
  { value: BLOCKCHAINS.NEAR, label: 'NEAR' },
  { value: BLOCKCHAINS.POLKADOT, label: 'Polkadot' },
  { value: BLOCKCHAINS.POLYGON, label: 'Polygon' },
  { value: BLOCKCHAINS.SOLANA, label: 'Solana' },
];
const conditionTypes = [
  { value: AMOUNT_CONDITIONS.MORE, label: 'More than' },
  { value: AMOUNT_CONDITIONS.EQUAL, label: 'Equal to' },
  { value: AMOUNT_CONDITIONS.LESS, label: 'Less than' },
];

const RequirementSubForm = ({
  errors,
  defaultValues = {},
  onRemove = () => null,
  isRemoveable = true,
  onChange = () => null,
}: RequirementSubFormType) => {
  return (
    <div className="RequirementSubForm">
      <div className="row-1">
        <CWSelectList
          key={defaultValues?.requirementType?.value}
          name="requirementType"
          label="Requirement type"
          placeholder="Requirement type"
          {...(defaultValues.requirementType && {
            defaultValue: [defaultValues.requirementType],
          })}
          options={requirementTypes.map((requirement) => ({
            label: requirement.label,
            value: requirement.value,
          }))}
          onChange={(newValue) => {
            onChange({
              requirementType: newValue.value,
            });
          }}
          customError={errors.requirementType}
        />
        {isRemoveable && (
          <CWIconButton
            iconName="close"
            onClick={onRemove}
            className="ml-auto cursor-pointer"
          />
        )}
      </div>

      <div className="row-2">
        <CWSelectList
          key={defaultValues?.requirementChain?.value}
          name="requirementChain"
          label="Chain"
          placeholder="Chain"
          {...(defaultValues.requirementChain && {
            defaultValue: [defaultValues.requirementChain],
          })}
          options={chainTypes.map((chainType) => ({
            label: chainType.label,
            value: chainType.value,
          }))}
          onChange={(newValue) => {
            onChange({
              requirementChain: newValue.value,
            });
          }}
          customError={errors.requirementChain}
        />
        <CWTextInput
          key={defaultValues.requirementContractAddress}
          name="requirementContractAddress"
          label="Contract Address"
          placeholder="Input contract address"
          containerClassName="w-full"
          fullWidth
          manualStatusMessage=""
          {...(defaultValues.requirementContractAddress && {
            defaultValue: defaultValues.requirementContractAddress,
          })}
          onInput={(e) => {
            onChange({
              requirementContractAddress: (e.target as any).value,
            });
          }}
          customError={errors.requirementContractAddress}
        />
        <CWSelectList
          key={defaultValues?.requirementCondition?.value}
          name="requirementCondition"
          label="Condition"
          placeholder="Condition"
          {...(defaultValues.requirementCondition && {
            defaultValue: [defaultValues.requirementCondition],
          })}
          options={conditionTypes.map((conditionType) => ({
            label: conditionType.label,
            value: conditionType.value,
          }))}
          onChange={(newValue) => {
            onChange({
              requirementCondition: newValue.value,
            });
          }}
          customError={errors.requirementCondition}
        />
        <CWTextInput
          key={defaultValues.requirementAmount}
          name="requirementAmount"
          label="Amount"
          placeholder="Amount"
          {...(defaultValues.requirementAmount && {
            defaultValue: defaultValues.requirementAmount,
          })}
          onInput={(e) => {
            onChange({
              requirementAmount: (e.target as any).value,
            });
          }}
          customError={errors.requirementAmount}
        />
      </div>
    </div>
  );
};

export default RequirementSubForm;
