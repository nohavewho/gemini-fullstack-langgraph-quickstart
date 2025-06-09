import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Shield, Globe, Users, Zap, Lock } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export function LoginPage() {
  const { isAuthenticated, loginWithRedirect } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('feature_global_monitoring'),
      description: t('feature_global_desc')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('feature_real_time'),
      description: t('feature_real_time_desc')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('feature_trusted_sources'),
      description: t('feature_trusted_desc')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('feature_multi_language'),
      description: t('feature_multi_language_desc')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              {t('monitor_title')}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
            {t('login_subtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="text-left space-y-2">
                <div className="text-blue-600">{feature.icon}</div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md p-8 shadow-xl">
            <div className="text-center space-y-6">
              <Lock className="w-12 h-12 text-blue-600 mx-auto" />
              
              <div>
                <h2 className="text-2xl font-bold mb-2">{t('welcome_back')}</h2>
                <p className="text-gray-600">{t('login_to_continue')}</p>
              </div>

              <Button
                onClick={() => loginWithRedirect()}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {t('login_with_email')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('or_continue_with')}</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })}
                  className="h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>

                <Button
                  variant="outline"
                  onClick={() => loginWithRedirect({ authorizationParams: { connection: 'facebook' } })}
                  className="h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>

                <Button
                  variant="outline"
                  onClick={() => loginWithRedirect({ authorizationParams: { connection: 'vkontakte' } })}
                  className="h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#0077FF">
                    <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.071.587-.964c-.043-.073-.308-.661-1.588-1.87-1.34-1.264-1.16-1.059.453-3.246.983-1.332 1.376-2.145 1.253-2.493-.117-.332-.84-.244-.84-.244l-2.406.015s-.178-.025-.31.056c-.13.079-.212.262-.212.262s-.382 1.03-.89 1.907c-1.07 1.85-1.499 1.948-1.674 1.832-.407-.267-.305-1.075-.305-1.648 0-1.793.267-2.54-.521-2.733-.262-.065-.454-.107-1.123-.114-.858-.01-1.585.003-1.996.208-.274.136-.486.44-.357.458.16.022.52.099.71.364.247.343.238 1.114.238 1.114s.142 2.124-.331 2.386c-.325.18-.77-.187-1.725-1.865-.489-.859-.859-1.81-.859-1.81s-.07-.176-.198-.272c-.154-.115-.37-.151-.37-.151l-2.286.015s-.343.01-.469.161c-.112.135-.009.414-.009.414s1.792 4.252 3.817 6.393c1.858 1.961 3.968 1.832 3.968 1.832h.957z"/>
                  </svg>
                  VKontakte
                </Button>

                <Button
                  variant="outline"
                  onClick={() => loginWithRedirect({ authorizationParams: { connection: 'yandex' } })}
                  className="h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#FF0000" d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm13.97 4.46h1.42V4.51h-2.42c-2.86 0-4.66 1.8-4.66 4.11 0 1.62.86 2.89 2.33 3.64L9.71 16.46h1.67l2.64-3.98h1.23l.72-1.08h-1.98c-1.9 0-3.29-1.28-3.29-3.28 0-1.76 1.23-3.04 3.26-3.04h.01v11.38z"/>
                  </svg>
                  Yandex
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                className="w-full h-12"
              >
                {t('create_account')}
              </Button>

              <p className="text-xs text-gray-500">
                {t('by_continuing')} <a href="#" className="text-blue-600 hover:underline">{t('terms')}</a> {t('and')} <a href="#" className="text-blue-600 hover:underline">{t('privacy')}</a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}