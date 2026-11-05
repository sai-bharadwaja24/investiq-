import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data_engine.yahoo_provider import default_provider

def test_budget_stocks_under_500():
    resp = default_provider.get_budget_stocks()
    assert resp.total_count > 0
    assert len(resp.stocks) > 0
    for stock in resp.stocks:
        assert stock.price <= 500
        assert stock.price > 0
        assert stock.budget_tier in ['UNDER_100', '100_TO_250', '250_TO_500']
        assert stock.shares_per_5k > 0
        assert stock.potential_profit_5k > 0

def test_budget_stocks_api_endpoint():
    client = TestClient(app)
    response = client.get('/api/markets/budget-stocks')
    assert response.status_code == 200
    data = response.json()
    assert 'stocks' in data
    assert data['total_count'] > 0
