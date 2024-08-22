import { useNotification } from '@strapi/helper-plugin'

export function useAlert() {
  const toggleNotification = useNotification() // HERE
  const handleNotification = ({
    type = 'info',
    id,
    defaultMessage,
    link,
    blockTransition = true,
  }: { type?: "info" | "warning" | "softWarning" | "success"; id: string, defaultMessage?: string; link?: any; blockTransition?: boolean }) => {
    toggleNotification({
      // required
      // type: 'info|success|warning',
      type,
      // required
      message: {
        id,
        defaultMessage,
      },
      // optional
      link,
      // optional: default = false
      blockTransition,
      // optional
      onClose: () => localStorage.setItem('STRAPI_UPDATE_NOTIF', "true"),
    })
  }

  return {
    handleNotification,
  }
}

export default useAlert
