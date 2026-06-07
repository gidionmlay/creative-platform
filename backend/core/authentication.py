from rest_framework.authentication import TokenAuthentication


class BearerTokenAuthentication(TokenAuthentication):
    """
    Custom token authentication that previously accepted 'Bearer'.
    Updated to use 'Token' keyword to normalize with frontend globally.
    """
    keyword = 'Token'
