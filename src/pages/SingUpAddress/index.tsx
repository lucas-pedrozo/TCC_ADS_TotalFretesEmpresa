import { InputDefault } from '@/components/custom/inputs/InputDefault'
import { SelectDefault } from '@/components/custom/inputs/SelectDefault'
import { ButtonDefault } from '@/components/custom/buttons/ButtonDefault'
import { AuthLayout } from '@/layout/AuthLayout'
import { useRegisterCompanyAddress } from '@/hooks/useRegisterCompanyAddress'
import { useRegisterCompany } from '@/hooks/useRegisterCompany'
import { useFadeNavigate } from '@/hooks/useFadeNavigate'
import { useMountFadeIn } from '@/hooks/useMountFadeIn'
import { useTranslation } from 'react-i18next'

const SingUpAddressPage = () => {
  const { t } = useTranslation()
  const { isExiting, navigateWithFade } = useFadeNavigate()
  const { handleRegisterCompany, isDisabled, isLoading } = useRegisterCompany(navigateWithFade)
  const {
    Rules,
    control,
    country,
    countryOptions,
    stateOptions,
    hasStateOptions,
    isSearchingCep,
    handleNextCompanyAddress,
  } = useRegisterCompanyAddress(
    handleRegisterCompany,
  )
  const contentClassName = useMountFadeIn({
    className: 'flex w-full min-h-[calc(100dvh-7rem)] py-4 min-[970px]:py-6 flex-col justify-center gap-6',
    isExiting,
  })

  return (
    <AuthLayout onBack={() => navigateWithFade('/SignUp')} isExiting={isExiting} transparent>
      <div className={contentClassName}>
        <div className="w-full">
          <h3 className="text-5xl font-bold text-start">{t('pages.singupAddress.title')}</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleNextCompanyAddress()
          }}
          className="flex flex-col gap-2 w-full"
        >
          <SelectDefault
            name="country"
            control={control}
            rules={Rules.country}
            label={t('pages.singupAddress.countryLabel')}
            options={countryOptions}
          />

          <InputDefault
            name="cep"
            placeholder={t('pages.singupAddress.cepPlaceholder')}
            control={control}
            rules={Rules.cep}
            label={t('pages.singupAddress.cepLabel')}
            mask={country === 'BR' ? 'cep' : 'default'}
            maxLength={country === 'BR' ? 9 : undefined}
          />

          {isSearchingCep && (
            <span className="pl-2.5 text-sm text-black/60">
              {t('pages.singupAddress.searchingCep')}
            </span>
          )}

          <InputDefault
            name="city"
            placeholder={t('pages.singupAddress.cityPlaceholder')}
            control={control}
            rules={Rules.city}
            label={t('pages.singupAddress.cityLabel')}
          />

          <InputDefault
            name="street"
            placeholder={t('pages.singupAddress.streetPlaceholder')}
            control={control}
            rules={Rules.street}
            label={t('pages.singupAddress.streetLabel')}
          />

          <InputDefault
            name="number"
            placeholder={t('pages.singupAddress.numberPlaceholder')}
            control={control}
            rules={Rules.number}
            label={t('pages.singupAddress.numberLabel')}
          />

          <InputDefault
            name="district"
            placeholder={t('pages.singupAddress.districtPlaceholder')}
            control={control}
            rules={Rules.district}
            label={t('pages.singupAddress.districtLabel')}
          />

          {hasStateOptions ? (
            <SelectDefault
              name="state"
              control={control}
              rules={Rules.state}
              label={t('pages.singupAddress.stateLabel')}
              placeholder={t('pages.singupAddress.statePlaceholder')}
              options={stateOptions}
            />
          ) : (
            <InputDefault
              name="state"
              placeholder={t('pages.singupAddress.statePlaceholder')}
              control={control}
              rules={Rules.state}
              label={t('pages.singupAddress.stateLabel')}
            />
          )}

          <div className="pt-5">
            <ButtonDefault
              type="submit"
              dataTestid="signup-address-submit-button"
              disabled={isDisabled}
              isLoading={isLoading}
              color="default"
            >
              {t('pages.singupAddress.submitButton')}
            </ButtonDefault>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SingUpAddressPage
