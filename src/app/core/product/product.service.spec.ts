import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { WalletService } from '../wallet/wallet.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Product } from './product';
import { AuthService } from '../auth/auth.service';
import { mockUser } from '../auction/spec-files/mocked';
import { mockedvenlyWalletNft } from 'app/core/auction/spec-files/mocked';
import { mockedNftMetadata } from 'app/modules/landing/nft-details/spec-files/mocked';

const baseUrl = environment.apiUrl;

describe('ProductService', () => {
  let authService: AuthService;
  let walletService: WalletService;
  let service: ProductService;
  let httpTestingController: HttpTestingController;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  routerMock.navigate.and.returnValue(of(false));
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuthHeader', 'user', 'updateWalletAddresses', 'updateLinkedWalletAddresses', 'getDefaultAvatar']);
  authServiceMock.user = mockUser;
  authServiceMock.updateWalletAddresses.and.returnValue(of(null));
  authServiceMock.updateLinkedWalletAddresses.and.returnValue(of(null));
  authServiceMock.getDefaultAvatar.and.returnValue('https://ipfs/akkj098');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: ProductService }, { provide: WalletService }, { provide: Router, useValue: routerMock }, { provide: AuthService, useValue: authServiceMock }]
    });
    service = TestBed.inject(ProductService);
    walletService = TestBed.inject(WalletService);
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Create Product', () => {
    it('should create product correctly', (done) => {
      const url = `${baseUrl}/product/create/`;
      const expectedResponse = {
        product: 'some product'
      };
      const data = {
        name: 'Test',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg'],
        walletAddress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('walletAddress', data.walletAddress);
      formData.append('images', JSON.stringify(data.images));

      service.createProduct(formData).subscribe(
        (res: any) => {
          expect(res).toEqual(expectedResponse);
          done();
        },
        (error: any) => {}
      );
      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error if name is not present', () => {
      const data = {
        name: 'Test',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg'],
        walletAddress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('walletAddress', data.walletAddress);
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.createProduct(formData).subscribe()).toThrowError('Product name is not present');
    });

    it('should throw an error if description is not present', () => {
      const data = {
        name: 'Test',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg'],
        walletAddress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('walletAddress', data.walletAddress);
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.createProduct(formData).subscribe()).toThrowError('Product description is not present');
    });

    it('should throw an error if properties are not present', () => {
      const data = {
        name: 'Test',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg'],
        walletAddress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', JSON.stringify(data.name));
      formData.append('description', data.description);
      formData.append('walletAddress', data.walletAddress);
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.createProduct(formData).subscribe()).toThrowError('Product properties are not present');
    });

    it('should throw an error if wallet address is not present', () => {
      const data = {
        name: 'Test',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg'],
        walletAddress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.createProduct(formData).subscribe()).toThrowError('Wallet Address is not present');
    });

    it('should throw an error if properties are invalid JSON String', () => {
      const data = {
        name: 'Test',
        description: 'Some description about the NFT',
        properties: [],
        images: ['test1.png', 'test2.jpg'],
        walletAddress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('properties', data.properties.toString());
      formData.append('walletAddress', data.walletAddress);
      formData.append('images', JSON.stringify(data.images));
      expect(() => service.createProduct(formData).subscribe()).toThrowError('Properties are not a valid JSON string');
    });
  });

  describe('Get Product', () => {
    it('should get the product correctly', (done) => {
      const id: string = '1';
      const url = `${baseUrl}/product/token/${id}`;
      const expectedResponse = {
        _id: id
      };

      service.getProduct(id).subscribe(
        (res) => {
          expect(res._id).toBe(id);
          done();
        },
        (error: any) => {}
      );

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('GET');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error if invalid id is provided', () => {
      const id: string = null;
      expect(() => service.getProduct(id).subscribe()).toThrowError('Invalid Id');
    });
  });

  describe('create collection', () => {
    it('should create a product collection correctly', (done) => {
      const url = `${baseUrl}/product/createCollection/`;
      const expectedResponse = {
        collection: {}
      };
      const data = {
        name: 'Test Product collection',
        description: 'Some description about the Test Product',
        symbol: 'Test symbol',
        images: ['test1.png', 'test2.jpg'],
        walletAdress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('symbol', JSON.stringify(data.symbol));
      formData.append('images', JSON.stringify(data.images));
      formData.append('walletAddress', JSON.stringify(data.walletAdress));

      service.createCollection(formData).subscribe((res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      });
      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error if name is not present', () => {
      const data = {
        name: 'Test Product collection',
        description: 'Some description about the Test Product',
        symbol: 'Test symbol',
        images: ['test1.png', 'test2.jpg'],
        walletAdress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('symbol', JSON.stringify(data.symbol));
      formData.append('images', JSON.stringify(data.images));
      formData.append('walletAddress', JSON.stringify(data.walletAdress));
      expect(() => service.createCollection(formData).subscribe()).toThrowError('Collection name is not present');
    });

    it('should throw an error if description is not present', () => {
      const data = {
        name: 'Test Product collection',
        description: 'Some description about the Test Product',
        symbol: 'Test symbol',
        images: ['test1.png', 'test2.jpg'],
        walletAdress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('symbol', JSON.stringify(data.symbol));
      formData.append('images', JSON.stringify(data.images));
      formData.append('walletAddress', JSON.stringify(data.walletAdress));
      expect(() => service.createCollection(formData).subscribe()).toThrowError('Collection description is not present');
    });

    it('should throw an error if symbol is not present', () => {
      const data = {
        name: 'Test Product collection',
        description: 'Some description about the Test Product',
        symbol: 'Test symbol',
        images: ['test1.png', 'test2.jpg'],
        walletAdress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', JSON.stringify(data.name));
      formData.append('description', data.description);
      formData.append('images', JSON.stringify(data.images));
      formData.append('walletAddress', JSON.stringify(data.walletAdress));
      expect(() => service.createCollection(formData).subscribe()).toThrowError('Collection symbol is not present');
    });

    it('should throw an error if name is not present', () => {
      const data = {
        name: 'Test Product collection',
        description: 'Some description about the Test Product',
        symbol: 'Test symbol',
        images: ['test1.png', 'test2.jpg'],
        walletAdress: walletService.currentAccount
      };
      const formData = new FormData();
      formData.append('name', JSON.stringify(data.name));
      formData.append('description', data.description);
      formData.append('symbol', JSON.stringify(data.symbol));
      formData.append('images', JSON.stringify(data.images));
      expect(() => service.createCollection(formData).subscribe()).toThrowError('Wallet Address is not present');
    });
  });

  describe('get Collection', () => {
    it('should get the product collection correctly', (done) => {
      const url = `${baseUrl}/product/getCollections/`;
      const expectedResponse = {
        collection: {}
      };
      const data = {
        walletAddress: 'Some address'
      };
      service.getCollections(data).subscribe((res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      });
      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error if wallet address is not present', () => {
      const data = {
        walletAddress: null
      };

      expect(() => service.getCollections(data).subscribe()).toThrowError('Wallet Address is not present');
    });
  });

  it('should get NFTs Metadata correctly', (done) => {
    const id = '1';
    const url = `${baseUrl}/product/getNFtMedata/${id}`;
    const expectedResponse = {
      nfts: []
    };

    service.getNFTMetadata(id).subscribe(
      (res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      },
      (error: any) => {}
    );
    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  describe('Update NFTs Metadata', () => {
    it('should update NFTs Metadata correctly', (done) => {
      const url = `${baseUrl}/product/updateMeta`;
      const expectedResponse = {
        nfts: []
      };
      const data = {
        id: 1,
        name: 'Test NFT',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg']
      };
      const formData = new FormData();
      formData.append('id', data.id.toString());
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('images', JSON.stringify(data.images));

      service.updateMetadata(formData).subscribe((res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      });
      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error if name is not present', () => {
      const data = {
        id: 1,
        name: 'Test NFT',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg']
      };
      const formData = new FormData();
      formData.append('id', data.id.toString());
      formData.append('description', data.description);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.updateMetadata(formData).subscribe()).toThrowError('Name is not present');
    });

    it('should throw an error if description is not present', () => {
      const data = {
        id: 1,
        name: 'Test NFT',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg']
      };
      const formData = new FormData();
      formData.append('id', data.id.toString());
      formData.append('name', data.name);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.updateMetadata(formData).subscribe()).toThrowError('Description is not present');
    });

    it('should throw an error if properties are not present', () => {
      const data = {
        id: 1,
        name: 'Test NFT',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg']
      };
      const formData = new FormData();
      formData.append('id', data.id.toString());
      formData.append('name', JSON.stringify(data.name));
      formData.append('description', data.description);
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.updateMetadata(formData).subscribe()).toThrowError('Properties are not present');
    });

    it('should throw an error if id is not present', () => {
      const data = {
        id: 1,
        name: 'Test NFT',
        description: 'Some description about the NFT',
        properties: [{ name: 'Some Name', value: 'Some Value' }],
        images: ['test1.png', 'test2.jpg']
      };
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('properties', JSON.stringify(data.properties));
      formData.append('images', JSON.stringify(data.images));

      expect(() => service.updateMetadata(formData).subscribe()).toThrowError('Id is not present');
    });
  });

  it('should get the NFTs listing correctly', (done) => {
    const url = `${baseUrl}/product/getNFTsBasedOnWalletAddress/${walletService.currentAccount}`;
    const expectedResponse = {
      nfts: []
    };

    service.listingNFT().subscribe(
      (res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      },
      (error: any) => {}
    );
    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  describe('Create NFTs for sale', () => {
    it('should create NFTs for sale correctly', (done) => {
      const url = `${baseUrl}/product/createSaleOffer/`;
      const expectedResponse = {
        product: 'some product'
      };
      const data = {
        tokenId: '#123',
        address: 'some address',
        sellerAddress: walletService.currentAccount,
        price: 0,
        chain: 'RINKEBY'
      };
      const formData = new FormData();
      formData.append('tokenId', data.tokenId);
      formData.append('address', data.address);
      formData.append('sellerAddress', JSON.stringify(data.sellerAddress));
      formData.append('price', JSON.stringify(data.price));
      formData.append('chain', JSON.stringify(data.chain));

      service.createForSale(formData).subscribe(
        (res: any) => {
          expect(res).toEqual(expectedResponse);
          done();
        },
        (error: any) => {}
      );
      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error if token id is not present', () => {
      const data = {
        tokenId: '#123',
        address: 'some address',
        sellerAddress: walletService.currentAccount,
        price: 0
      };
      const formData = new FormData();
      formData.append('address', data.address);
      formData.append('sellerAddress', JSON.stringify(data.sellerAddress));
      formData.append('price', JSON.stringify(data.price));

      expect(() => service.createForSale(formData).subscribe()).toThrowError('Token id is not present');
    });

    it('should throw an error if address is not present', () => {
      const data = {
        tokenId: '#123',
        address: 'some address',
        sellerAddress: walletService.currentAccount,
        price: 0
      };
      const formData = new FormData();
      formData.append('tokenId', data.tokenId);
      formData.append('sellerAddress', JSON.stringify(data.sellerAddress));
      formData.append('price', JSON.stringify(data.price));

      expect(() => service.createForSale(formData).subscribe()).toThrowError('Address is not present');
    });

    it('should throw an error if Seller Address is not present', () => {
      const data = {
        tokenId: '#123',
        address: 'some address',
        sellerAddress: walletService.currentAccount,
        price: 0
      };
      const formData = new FormData();
      formData.append('tokenId', JSON.stringify(data.tokenId));
      formData.append('address', data.address);
      formData.append('price', JSON.stringify(data.price));

      expect(() => service.createForSale(formData).subscribe()).toThrowError('Seller Address is not present');
    });

    it('should throw an error if price is not present', () => {
      const data = {
        tokenId: '#123',
        address: 'some address',
        sellerAddress: walletService.currentAccount,
        price: 0
      };
      const formData = new FormData();
      formData.append('tokenId', JSON.stringify(data.tokenId));
      formData.append('address', data.address);
      formData.append('sellerAddress', JSON.stringify(data.sellerAddress));

      expect(() => service.createForSale(formData).subscribe()).toThrowError('Price is not present');
    });
  });

  it('should get the NFTs offers correctly', (done) => {
    const url = `${baseUrl}/product/listSaleOffers?auctionOffers=false`;
    const expectedResponse = {
      nfts: []
    };

    service.getAllListings().subscribe(
      (res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      },
      (error: any) => {}
    );
    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the single offer correctly', (done) => {
    const id: string = '1';
    const url = `${baseUrl}/product/offer/${id}`;
    const expectedResponse = {
      stats: {}
    };

    service.specificOffer(id).subscribe(
      (res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      },
      (error: any) => {}
    );
    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the user dashboard stats correctly', (done) => {
    const url = `${baseUrl}/product/getStats`;
    const expectedResponse = {
      stats: {}
    };

    service.getStats().subscribe(
      (res: any) => {
        expect(res).toEqual(expectedResponse);
        done();
      },
      (error: any) => {}
    );
    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get user order history correctly', (done) => {
    const url = `${baseUrl}/order/index`;
    const expectedResponse = {
      stats: {}
    };

    service.getOrderHistory().subscribe((res: any) => {
      expect(res).toEqual(expectedResponse);
      done();
    });
    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get all ready listings', () => {
    const spyGetListings = spyOn(service, 'getAllListings').and.callThrough();

    service.getAllReadyListings();

    expect(spyGetListings).toHaveBeenCalledWith('READY');
  });

  it('should send a request to server to edit listing', () => {
    const url = `${baseUrl}/product/editOffer`;
    const data = {
      id: '123',
      name: 'Test',
      description: 'Some description about the NFT',
      properties: [{ name: 'Some Name', value: 'Some Value' }],
      images: ['test1.png', 'test2.jpg'],
      walletAddress: walletService.currentAccount
    };
    const expectedResponse = {
      nft: data
    };

    service.editListing(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should send a request to server to edit listing', () => {
    const url = `${baseUrl}/product/cancelOffer`;
    const data = {
      id: '123',
      name: 'Test',
      description: 'Some description about the NFT',
      properties: [{ name: 'Some Name', value: 'Some Value' }],
      images: ['test1.png', 'test2.jpg'],
      walletAddress: walletService.currentAccount
    };
    const expectedResponse = {
      nft: data
    };

    service.cancelListing(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  describe('GetHistory', () => {
    it('should throw an error if any collection id is not present', () => {
      const tokenId = '123';
      const collectionId = null;

      expect(() => service.getHistory(tokenId, collectionId)).toThrowError('Data is not present');
    });

    it('should throw an error if any token id is not present', () => {
      const tokenId = null;
      const collectionId = 'test345';

      expect(() => service.getHistory(tokenId, collectionId)).toThrowError('Data is not present');
    });

    it('should get history', () => {
      const tokenId = '123';
      const collectionId = 'test345';
      const url = `${baseUrl}/order/getHistory/${tokenId}/${collectionId}`;
      const expectedResponse = {
        message: 'Orders was sucessfully get!',
        data: []
      };

      service.getHistory(tokenId, collectionId).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('GET');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });

  describe('GetUserOfCollection', () => {
    it('should throw an error if collection id is not present', () => {
      const id = null;

      expect(() => service.getUserOfCollection(id)).toThrowError('Invalid Id');
    });

    it('should get the user who owns the collection', () => {
      const expectedResponse = {
        data: mockUser
      };
      const id = 'test345';
      const url = `${baseUrl}/product/getOneCollection/`;

      service.getUserOfCollection(id).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });

  it('should get NFTs for a specific wallet', () => {
    const expectedResponse = { data: [mockedvenlyWalletNft] };
    const url = `${baseUrl}/product/getNFTsBasedOnWalletAddress/testAddress`;

    service.listingNFTByWallet('testAddress').subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get NFTs for all linked wallets of a specific user', () => {
    const expectedResponse = { data: [mockedvenlyWalletNft] };
    const url = `${baseUrl}/product/getNFTsBasedOnUserWalletAddressesByUser/${mockUser.id}`;

    service.listingNFTByLinkedWallets().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get NFT metadata from its contract', () => {
    const contractAddress = 'testAddress';
    const tokenId = '123';
    const expectedResponse = { data: mockedNftMetadata };
    const url = `${baseUrl}/product/getNftMetadataByContract/${contractAddress}/${tokenId}`;

    service.getNFTMetadataByContract(contractAddress, tokenId).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });
});
